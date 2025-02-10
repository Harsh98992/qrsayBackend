from g4f.client import Client
import glob
import re

client = Client()

def get_response(message):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": message}],
        web_search = False
    )
    return response.choices[0].message.content

# not only python files but also other files like txt, md, etc
# files = glob.glob('**/*.*', recursive=True) remove documentation folder
files = glob.glob('**/*.*', recursive=True)
files = [file for file in files if not re.match(r'documentation', file)]
files = [file for file in files if not re.match(r'create_documentation', file)]
files = [file for file in files if not re.match(r'g4f', file)]

for file in files:
    with open(file) as f:
        content = f.read()

        content = "please generate documentation for this file in markdown format\n" + content
        response = get_response(content)
        with open('documentation/' + file + '.md', 'w') as f:
            f.write(response)