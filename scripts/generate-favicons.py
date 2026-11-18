from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = ROOT / "source-assets" / "brand" / "keerthana-logo.png"
BURGUNDY = (53, 4, 15, 255)
PADDING = 0.10


def trim_visible_logo():
    logo = Image.open(SOURCE).convert("RGBA")
    alpha = logo.getchannel("A")
    # Ignore near-transparent specks in the source canvas while preserving the
    # antialiased edge pixels surrounding the visible mark.
    visible = alpha.point(lambda value: 255 if value >= 8 else 0)
    bounds = visible.getbbox()
    if bounds is None:
        raise ValueError(f"No visible logo pixels found in {SOURCE}")

    left, top, right, bottom = bounds
    margin = 2
    bounds = (
        max(0, left - margin),
        max(0, top - margin),
        min(logo.width, right + margin),
        min(logo.height, bottom + margin),
    )
    return logo.crop(bounds)


def make_icon(logo, size, burgundy_background=False):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if burgundy_background:
        draw = ImageDraw.Draw(canvas)
        radius = round(size * 0.18)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=BURGUNDY)

    available = size * (1 - 2 * PADDING)
    scale = available / max(logo.width, logo.height)
    logo_size = (max(1, round(logo.width * scale)), max(1, round(logo.height * scale)))
    resized = logo.resize(logo_size, Image.Resampling.LANCZOS)
    offset = ((size - logo_size[0]) // 2, (size - logo_size[1]) // 2)
    canvas.alpha_composite(resized, offset)
    return canvas


def main():
    logo = trim_visible_logo()

    make_icon(logo, 48, burgundy_background=True).save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    make_icon(logo, 32, burgundy_background=True).save(
        PUBLIC / "favicon-32x32.png", optimize=True
    )
    make_icon(logo, 16, burgundy_background=True).save(
        PUBLIC / "favicon-16x16.png", optimize=True
    )

    for filename, size in (
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
    ):
        make_icon(logo, size, burgundy_background=True).save(
            PUBLIC / filename,
            optimize=True,
        )

    print(f"Trimmed logo bounds: {logo.size}")
    for path in (
        PUBLIC / "favicon.ico",
        PUBLIC / "favicon-32x32.png",
        PUBLIC / "favicon-16x16.png",
        PUBLIC / "apple-touch-icon.png",
        PUBLIC / "icon-192.png",
        PUBLIC / "icon-512.png",
    ):
        print(f"{path.name}: {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
