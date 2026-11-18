from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets"
OUTPUT = ROOT / "public" / "assets"
IMAGES = (
    "characters/portfolio-about-polaroid.png",
    "characters/portfolio-home.png",
    "projects/signbridge.png",
    "decor/red-lily.png",
    "decor/red-hibiscus.png",
    "brand/keerthana-logo.png",
    "projects/unix-card.png",
    "projects/skysense-card.png",
)
LOGO_MAX_WIDTH = 800


def convert_image(relative_path):
    source_path = SOURCE / relative_path
    output_path = OUTPUT / Path(relative_path).with_suffix(".webp")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as original:
        image = original.convert("RGBA" if "A" in original.getbands() else "RGB")
        if relative_path == "brand/keerthana-logo.png" and image.width > LOGO_MAX_WIDTH:
            height = round(image.height * LOGO_MAX_WIDTH / image.width)
            image = image.resize((LOGO_MAX_WIDTH, height), Image.Resampling.LANCZOS)
        dimensions = image.size
        image.save(output_path, format="WEBP", quality=90, method=6)

    return source_path, output_path, dimensions


def main():
    for relative_path in IMAGES:
        source_path, output_path, dimensions = convert_image(relative_path)
        print(
            f"{source_path.relative_to(ROOT)} -> {output_path.relative_to(ROOT)} "
            f"({dimensions[0]}x{dimensions[1]}): "
            f"{source_path.stat().st_size:,} -> {output_path.stat().st_size:,} bytes"
        )


if __name__ == "__main__":
    main()
