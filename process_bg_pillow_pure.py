from PIL import Image
import base64
import sys

def remove_background_and_convert(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening image: {e}")
        sys.exit(1)
        
    datas = img.getdata()

    newData = []
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

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
