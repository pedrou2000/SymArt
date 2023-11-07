import re
import cairosvg
import numpy as np
from miniball import get_bounding_ball
import xml.etree.ElementTree as ET


def parse_svg_file(svg_file_path):
    with open(svg_file_path, 'r') as file:
        svg_content = file.read()
    points = parse_svg_path_data(svg_content)
    return points, svg_content

def parse_svg_path_data(svg_content):
    points = []
    path_regex = re.compile(r'd="([^"]*)"')
    move_to_line_to_regex = re.compile(r'M (\d+(?:\.\d+)?) (\d+(?:\.\d+)?) L \1 \2')

    for path_match in path_regex.finditer(svg_content):
        d = path_match.group(1)
        for mtlt_match in move_to_line_to_regex.finditer(d):
            points.append((float(mtlt_match.group(1)), float(mtlt_match.group(2))))

    return np.array(points)

def calculate_enclosing_circle(points):
    center, squared_radius = get_bounding_ball(points)
    radius = np.sqrt(squared_radius)
    return center, radius

def create_circle_svg(center, radius, width, height):
    svg_content = f'<svg width="{width}px" height="{height}px" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">'
    svg_content += f'<circle cx="{center[0]}" cy="{center[1]}" r="{radius}" fill="none" stroke="black"/></svg>'
    return svg_content

def svg_to_png(svg_content, output_file, scale_factor=1, center=None, radius=None):
    # If center and radius are provided, we adjust the viewbox and size to crop to the circle
    if center is not None and radius is not None:
        adjusted_radius = radius * scale_factor
        new_width = new_height = adjusted_radius * 2
        viewbox_x = center[0] - radius
        viewbox_y = center[1] - radius
        viewbox_width = viewbox_height = new_width

        # Adjust the svg content viewbox and size to center on the circle
        svg_tree = ET.fromstring(svg_content.encode('utf-8'))
        svg_tree.set('viewBox', f"{viewbox_x} {viewbox_y} {viewbox_width} {viewbox_height}")
        svg_tree.set('width', str(new_width))
        svg_tree.set('height', str(new_height))
        svg_content = ET.tostring(svg_tree, encoding='unicode')
    else:
        # Parse the original SVG content to get the width and height
        svg_tree = ET.fromstring(svg_content.encode('utf-8'))
        original_width = int(svg_tree.get('width', 1920))
        original_height = int(svg_tree.get('height', 880))

        # Calculate the new width and height based on the scaling factor
        new_width = original_width * scale_factor
        new_height = original_height * scale_factor

    # Convert the SVG content to a PNG file with the new dimensions
    cairosvg.svg2png(bytestring=svg_content.encode('utf-8'), write_to=output_file, output_width=new_width, output_height=new_height)

from PIL import Image

def apply_circle_clip_to_svg(original_svg_content, center, radius):
    # Add a clipping path to the SVG content
    clip_path_svg = f'<clipPath id="clipCircle"><circle cx="{center[0]}" cy="{center[1]}" r="{radius}" /></clipPath>'
    # Insert the clip path just before the first <g> element
    g_index = original_svg_content.find('<g')
    clipped_svg_content = original_svg_content[:g_index] + clip_path_svg + original_svg_content[g_index:]
    # Apply the clipping path to all elements by modifying the <g> tags
    clipped_svg_content = re.sub(r'(<g)', r'\1 clip-path="url(#clipCircle)"', clipped_svg_content)
    return clipped_svg_content

# Main process
data_path = 'images/'
svg_file_path = data_path + 'myCanvas.svg'  # Replace with your SVG file path
png_temp_file_path = data_path + 'circle.png'  # Temporary file path for the PNG
jpg_output_file_path = data_path + 'enclosing_circle.jpg'  # Final JPG output file path
# Define your scale factor
scale_factor = 10  # For example, to double the resolution

# Call the function with the scale factor

points, original_svg_content = parse_svg_file(svg_file_path)
center, radius = calculate_enclosing_circle(points)
clipped_svg_content = apply_circle_clip_to_svg(original_svg_content, center, radius)
svg_to_png(clipped_svg_content, png_temp_file_path, scale_factor)
print("The part of the figure contained in the smallest enclosing circle has been saved as PNG.")