from PIL import Image
import numpy as np
import base64
import sys

def remove_background_and_convert(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening image: {e}")
        sys.exit(1)
        
    data = np.array(img)
    
    # White background (RGB > 240)
    # Mask creation: all channels > 240
    # Create mask where R > 240 and G > 240 and B > 240
    r, g, b, a = data.T
    white_areas = (r > 240) & (g > 240) & (b > 240)
    
    # Set alpha to 0 for white areas
    data[..., 3][white_areas.T] = 0
    
    result_img = Image.fromarray(data)
    result_img.save(output_path)
    
    # Read output and print base64
    with open(output_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        print("BASE64_START")
        print(encoded_string)
        print("BASE64_END")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <input_path> <output_path>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    remove_background_and_convert(input_file, output_file)
