import os

dir_path = r'c:\Users\alvaf\Desktop\biometria\app'

for root, dirs, files in os.walk(dir_path):
    if 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.html', '.css', '.md')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # Replace Antigravity Ciudadano and antigravity
            new_content = content.replace('Antigravity Ciudadano', 'Respeto Vial Colombia')
            new_content = new_content.replace('antigravity', 'ciudadano')
            new_content = new_content.replace('Antigravity', 'Respeto Vial')
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {filepath}')
print('Done.')
