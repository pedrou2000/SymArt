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

def apply_circle_clip_to_svg(original_svg_content, center, radius):
    # Add a clipping path to the SVG content
    clip_path_svg = f'<clipPath id="clipCircle"><circle cx="{center[0]}" cy="{center[1]}" r="{radius}" /></clipPath>'
    # Insert the clip path just before the first <g> element
    g_index = original_svg_content.find('<g')
    clipped_svg_content = original_svg_content[:g_index] + clip_path_svg + original_svg_content[g_index:]
    # Apply the clipping path to all elements by modifying the <g> tags
    clipped_svg_content = re.sub(r'(<g)', r'\1 clip-path="url(#clipCircle)"', clipped_svg_content)
    return clipped_svg_content
def save_cropped_svg(svg_content, center, radius, output_file_path):
    # Calculate the bounding box of the circle
    x_min = center[0] - radius
    y_min = center[1] - radius
    width_height = radius * 2

    # Parse the SVG content
    root = ET.fromstring(svg_content)

    # Update the attributes of the root element for viewBox and size
    root.attrib['viewBox'] = f"{x_min} {y_min} {width_height} {width_height}"
    root.attrib['width'] = str(width_height)
    root.attrib['height'] = str(width_height)

    # Write to a new SVG file
    tree = ET.ElementTree(root)
    tree.write(output_file_path, encoding='utf-8', xml_declaration=True)

    # Get the modified SVG content as a string
    modified_svg_content = ET.tostring(root, encoding='utf-8', method='xml').decode('utf-8')

    return modified_svg_content

# Now use the returned modified SVG content to save as PNG:
def save_svg_as_png(svg_content, output_file_path, scale=1):
    root = ET.fromstring(svg_content)
    # Parse width and height as floats, then scale and convert to integers
    width = int(float(root.attrib['width']) * scale)
    height = int(float(root.attrib['height']) * scale)
    png_data = cairosvg.svg2png(bytestring=svg_content.encode('utf-8'), output_width=width, output_height=height)
    with open(output_file_path, 'wb') as png_file:
        png_file.write(png_data)
    print(f"Saved PNG file with scale {scale} at {output_file_path}")




# Main process
data_path = 'images/'
svg_file_path = data_path + 'myCanvas.svg'  # Replace with your SVG file path
svg_cropped_file_path = data_path + 'circle.svg'  # Replace with your SVG file path
png_output_file_path = data_path + 'circle.png'
scale_factor = 10  # For example, to double the resolution

# Call the function with the scale factor

points, original_svg_content = parse_svg_file(svg_file_path)
center, radius = calculate_enclosing_circle(points)
clipped_svg_content = apply_circle_clip_to_svg(original_svg_content, center, radius)
modified_svg_content = save_cropped_svg(clipped_svg_content, center, radius, svg_cropped_file_path)
save_svg_as_png(modified_svg_content, png_output_file_path, scale=scale_factor)



print("The part of the figure contained in the smallest enclosing circle has been saved as PNG.")
