from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets" / "decor" / "black-plant.png"
OUTPUT = ROOT / "public" / "assets" / "decor" / "black-plant-thin.png"
UPSCALE = 2


def main():
    original = Image.open(SOURCE).convert("RGBA")
    width, height = original.size
    alpha = original.getchannel("A")

    alpha_large = alpha.resize(
        (width * UPSCALE, height * UPSCALE),
        Image.Resampling.LANCZOS,
    )
    eroded_large = alpha_large.filter(ImageFilter.MinFilter(3))
    eroded = eroded_large.resize((width, height), Image.Resampling.LANCZOS)
    eroded = ImageChops.darker(alpha, eroded)

    result = original.copy()
    result.putalpha(eroded)
    result.save(OUTPUT, optimize=True)
    print(f"Created {OUTPUT.name}: {width}x{height}, {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
