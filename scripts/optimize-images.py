from pathlib import Path
import shutil

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets"
OUTPUT = ROOT / "public" / "assets"
IMAGES = (
    "characters/portfolio-about-polaroid.png",
    "characters/portfolio-home.png",
    "projects/signbridge.png",
    "decor/Red Lily.png",
    "decor/red-hibiscus.png",
    "brand/keerthana-logo.png",
    "projects/unix-card.png",
    "projects/skysense-card.png",
)
LOGO_MAX_WIDTH = 800
RED_LILY_MAX_WIDTH = 720
RED_LILY_QUALITY = 72
INTRO_FALLBACK = "characters/intro-character-waving-transparent-fallback.webp"
INTRO_FALLBACK_MAX_SIZE = (600, 338)
INTRO_FALLBACK_TARGET_BYTES = 1_500_000
INTRO_FALLBACK_METHOD = 4


def convert_image(relative_path):
    source_path = SOURCE / relative_path
    output_relative_path = (
        Path("decor/red-lily.webp")
        if relative_path == "decor/Red Lily.png"
        else Path(relative_path).with_suffix(".webp")
    )
    output_path = OUTPUT / output_relative_path
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as original:
        image = original.convert("RGBA" if "A" in original.getbands() else "RGB")
        if relative_path == "brand/keerthana-logo.png" and image.width > LOGO_MAX_WIDTH:
            height = round(image.height * LOGO_MAX_WIDTH / image.width)
            image = image.resize((LOGO_MAX_WIDTH, height), Image.Resampling.LANCZOS)
        elif relative_path == "decor/Red Lily.png" and image.width > RED_LILY_MAX_WIDTH:
            height = round(image.height * RED_LILY_MAX_WIDTH / image.width)
            image = image.resize((RED_LILY_MAX_WIDTH, height), Image.Resampling.LANCZOS)
        dimensions = image.size
        quality = RED_LILY_QUALITY if relative_path == "decor/Red Lily.png" else 90
        image.save(output_path, format="WEBP", quality=quality, method=6)

    return source_path, output_path, dimensions


def _webp_animation_durations(path, frame_count):
    data = path.read_bytes()
    durations = []
    offset = 12
    while offset + 8 <= len(data):
        chunk_type = data[offset : offset + 4]
        chunk_size = int.from_bytes(data[offset + 4 : offset + 8], "little")
        payload_start = offset + 8
        if chunk_type == b"ANMF" and chunk_size >= 16:
            durations.append(int.from_bytes(data[payload_start + 12 : payload_start + 15], "little"))
        offset = payload_start + chunk_size + (chunk_size % 2)

    if len(durations) != frame_count or not any(durations):
        durations = [
            round((index + 1) * 1000 / 24) - round(index * 1000 / 24)
            for index in range(frame_count)
        ]
    return durations


def convert_intro_fallback():
    source_path = SOURCE / INTRO_FALLBACK
    output_path = OUTPUT / INTRO_FALLBACK
    if not source_path.exists():
        source_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output_path, source_path)

    with Image.open(source_path) as original:
        frame_count = getattr(original, "n_frames", 1)
        if frame_count != 109:
            raise ValueError(f"Expected 109 fallback frames; found {frame_count}.")
        loop = original.info.get("loop", 0)
        durations = _webp_animation_durations(source_path, frame_count)
        frames = []
        for index in range(frame_count):
            original.seek(index)
            frame = original.convert("RGBA")
            frame.thumbnail(INTRO_FALLBACK_MAX_SIZE, Image.Resampling.LANCZOS)
            frames.append(frame.copy())

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = output_path.with_name(f"{output_path.stem}.optimized.webp")
    chosen_quality = None
    for quality in (18,):
        frames[0].save(
            temporary_path,
            format="WEBP",
            save_all=True,
            append_images=frames[1:],
            duration=durations,
            loop=loop,
            quality=quality,
            method=INTRO_FALLBACK_METHOD,
            exact=True,
        )
        chosen_quality = quality
        if temporary_path.stat().st_size < INTRO_FALLBACK_TARGET_BYTES:
            break

    with Image.open(temporary_path) as optimized:
        if optimized.n_frames != frame_count:
            raise ValueError(f"Optimized fallback has {optimized.n_frames} frames, expected {frame_count}.")
        if optimized.size != INTRO_FALLBACK_MAX_SIZE:
            raise ValueError(f"Optimized fallback dimensions are {optimized.size}.")
        if optimized.mode != "RGBA":
            raise ValueError(f"Optimized fallback lost transparency (mode: {optimized.mode}).")
        if optimized.info.get("loop", 0) != loop:
            raise ValueError("Optimized fallback loop behavior changed.")
    if _webp_animation_durations(temporary_path, frame_count) != durations:
        raise ValueError("Optimized fallback frame timing changed.")
    if temporary_path.stat().st_size >= INTRO_FALLBACK_TARGET_BYTES:
        raise ValueError("Optimized fallback did not meet the 1.5 MB size target.")

    temporary_path.replace(output_path)

    print(
        f"{source_path.relative_to(ROOT)} -> {output_path.relative_to(ROOT)} "
        f"({INTRO_FALLBACK_MAX_SIZE[0]}x{INTRO_FALLBACK_MAX_SIZE[1]}, {frame_count} frames, "
        f"quality {chosen_quality}): {source_path.stat().st_size:,} -> {output_path.stat().st_size:,} bytes"
    )


def main():
    for relative_path in IMAGES:
        source_path, output_path, dimensions = convert_image(relative_path)
        print(
            f"{source_path.relative_to(ROOT)} -> {output_path.relative_to(ROOT)} "
            f"({dimensions[0]}x{dimensions[1]}): "
            f"{source_path.stat().st_size:,} -> {output_path.stat().st_size:,} bytes"
        )
    convert_intro_fallback()


if __name__ == "__main__":
    main()
