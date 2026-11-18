from pathlib import Path
from statistics import mean

from PIL import Image, ImageFilter, ImageStat


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PROJECTS = ROOT / "source-assets" / "projects"
OUTPUT_PROJECTS = ROOT / "public" / "assets" / "projects"
TARGET_RATIO = 1.38
EDGE_ROWS = 4
BLUR_SOURCE_HEIGHT = 40
PNG_LIMIT = 400 * 1024


def average_edge_row(image):
    pixels = image.load()
    edge = Image.new("RGB", (image.width, 1))
    edge_pixels = []
    for x in range(image.width):
        samples = [pixels[x, y] for y in range(image.height - EDGE_ROWS, image.height)]
        edge_pixels.append(
            tuple(round(mean(sample[channel] for sample in samples)) for channel in range(3))
        )
    edge.putdata(edge_pixels)
    return edge


def edge_color(edge_row):
    return tuple(round(channel) for channel in ImageStat.Stat(edge_row).mean)


def extend_canvas(image, target_height, edge_row, flat_color):
    extra_height = target_height - image.height
    if extra_height <= 0:
        raise ValueError("The target aspect ratio must leave room below the original image.")

    edge_stddev = ImageStat.Stat(edge_row).stddev
    flat_edge = max(edge_stddev) <= 1.5
    flat_row = Image.new("RGB", (image.width, 1), flat_color)

    if flat_edge:
        fill = flat_row.resize((image.width, extra_height), Image.Resampling.NEAREST)
        method = "flat bottom-edge color fill"
    else:
        strip_top = max(0, image.height - BLUR_SOURCE_HEIGHT)
        bottom_strip = image.crop((0, strip_top, image.width, image.height))
        blur_radius = max(24, min(48, image.width * 0.03))
        blurred = bottom_strip.filter(ImageFilter.GaussianBlur(radius=blur_radius))
        stretched = blurred.transpose(Image.Transpose.FLIP_TOP_BOTTOM).resize(
            (image.width, extra_height), Image.Resampling.BICUBIC
        )
        fill = stretched.copy()
        stretched_pixels = stretched.load()
        fade_in_rows = min(20, extra_height)
        fade_to_color_start = round(extra_height * 0.7)
        fill_pixels = fill.load()

        for y in range(extra_height):
            row = Image.new("RGB", (image.width, 1))
            if y < fade_in_rows:
                row = Image.blend(edge_row, stretched.crop((0, y, image.width, y + 1)), y / fade_in_rows)
            else:
                row.putdata([stretched_pixels[x, y] for x in range(image.width)])

            if y >= fade_to_color_start:
                fade_length = max(1, extra_height - 1 - fade_to_color_start)
                alpha = (y - fade_to_color_start) / fade_length
                row = Image.blend(row, flat_row, min(1.0, alpha))
            fill.paste(row, (0, y))

        method = f"blurred, vertically stretched bottom {BLUR_SOURCE_HEIGHT}px"

    canvas = Image.new("RGB", (image.width, target_height), flat_color)
    canvas.paste(image, (0, 0))
    canvas.paste(fill, (0, image.height))
    return canvas, method


def create_card_image(source_name):
    source_path = SOURCE_PROJECTS / source_name
    image = Image.open(source_path).convert("RGB")
    target_height = round(image.width / TARGET_RATIO)
    edge_row = average_edge_row(image)
    color = edge_color(edge_row)
    canvas, extension_method = extend_canvas(image, target_height, edge_row, color)

    stem = source_path.stem
    png_path = OUTPUT_PROJECTS / f"{stem}-card.png"
    webp_path = OUTPUT_PROJECTS / f"{stem}-card.webp"
    canvas.save(png_path, format="PNG", optimize=True, compress_level=9)

    if png_path.stat().st_size > PNG_LIMIT:
        canvas.save(webp_path, format="WEBP", quality=90, method=6)
        png_path.unlink()
        output_path = webp_path
    else:
        if webp_path.exists():
            webp_path.unlink()
        output_path = png_path

    return {
        "source": source_path,
        "output": output_path,
        "dimensions": canvas.size,
        "extension_method": extension_method,
        "edge_color": color,
        "size": output_path.stat().st_size,
    }


if __name__ == "__main__":
    for result in (create_card_image("unix.png"), create_card_image("skysense.png")):
        color = "#%02X%02X%02X" % result["edge_color"]
        print(
            f"{result['source'].name} -> {result['output'].name}: "
            f"{result['dimensions'][0]}x{result['dimensions'][1]}, "
            f"{result['size']:,} bytes, extension {result['extension_method']}, "
            f"edge color {color}"
        )
