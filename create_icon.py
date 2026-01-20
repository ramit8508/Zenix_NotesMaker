#!/usr/bin/env python3
"""
Simple icon generator for NotesMaker
Creates a 512x512 PNG icon with gradient background and 'N' text
"""

from PIL import Image, ImageDraw, ImageFont
import sys

def create_icon(output_path="build/icon.png"):
    """Create a simple app icon"""
    # Create image with gradient-like background
    size = 512
    img = Image.new('RGB', (size, size), color='#3B82F6')
    draw = ImageDraw.Draw(img)
    
    # Add gradient effect
    for i in range(size):
        shade = int(59 + (i / size) * 30)  # 59 to 89
        color = f'#{shade:02x}82F6'
        draw.line([(0, i), (size, i)], fill=color, width=1)
    
    # Draw 'N' text in center
    try:
        # Try to use a nice font
        font = ImageFont.truetype("arial.ttf", 300)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    text = "N"
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - 20
    
    # Draw text with shadow
    draw.text((x+5, y+5), text, fill='#00000040', font=font)
    draw.text((x, y), text, fill='white', font=font)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"✅ Icon created: {output_path}")

if __name__ == '__main__':
    import os
    os.makedirs('build', exist_ok=True)
    create_icon()
