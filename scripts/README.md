# Asset scripts

- `create-project-card-images.py` builds the UniX and SkySense card images from originals in `source-assets/projects/`.
- `generate-favicons.py` builds the root favicon and app icon files from `source-assets/brand/keerthana-logo.png`.
- `optimize-images.py` converts the portfolio's PNG originals in `source-assets/` to WebP files in `public/assets/`, resizing the source lily and animated intro fallback for the displayed layout. The animated export uses method 4 after method 6 proved impractically slow for the 109-frame image.
- `thin-black-plant.py` builds the delicate plant variant as WebP from `source-assets/decor/black-plant.png`.
