import cv2
import numpy as np
import base64
import sys
import os

def remove_background_and_convert(input_path, output_path):
    # Read the image
    img = cv2.imread(input_path)
    if img is None:
        print(f"Error: Could not read image at {input_path}")
        sys.exit(1)

    # Convert to RGBA (add alpha channel)
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    # Define the white color range
    # Since it's a "white background", we look for pixels close to white
    lower_white = np.array([240, 240, 240, 255])
    upper_white = np.array([255, 255, 255, 255])

    # Create a mask for white pixels
    mask = cv2.inRange(rgba, lower_white, upper_white)

    # Set alpha to 0 for white pixels
    rgba[mask > 0] = [0, 0, 0, 0]

    # Save the result
    cv2.imwrite(output_path, rgba)
    print(f"Saved transparent image to {output_path}")

    # Convert to Base64
    with open(output_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
    # Return the base64 string
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
