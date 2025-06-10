#!/usr/bin/env python3
"""
简化版Markdown图片处理脚本
专门处理"从想法到落地.md"文件中的图片
"""

import os
import re
import requests
import hashlib
import time
from pathlib import Path
import subprocess

def download_image(url, images_dir, index):
    """下载单个图片"""
    print(f"正在下载第 {index} 个图片...")
    print(f"URL: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://intranetproxy.alipay.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # 生成文件名：使用序号 + URL hash的前8位
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        filename = f"image_{index:03d}_{url_hash}.png"
        filepath = os.path.join(images_dir, filename)
        
        # 保存图片
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ 下载成功: {filename}")
        return filename
        
    except Exception as e:
        print(f"✗ 下载失败: {e}")
        return None

def process_markdown_file():
    """处理Markdown文件"""
    markdown_file = "从想法到落地.md"
    images_dir = "images"
    
    # 检查文件是否存在
    if not os.path.exists(markdown_file):
        print(f"错误: 文件 {markdown_file} 不存在")
        return False
    
    # 创建images目录
    Path(images_dir).mkdir(exist_ok=True)
    print(f"创建图片目录: {images_dir}/")
    
    # 读取文件内容
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 查找所有图片URL
    pattern = r'!\[([^\]]*)\]\((https://intranetproxy\.alipay\.com/[^)]+)\)'
    matches = re.findall(pattern, content)
    
    if not matches:
        print("没有找到需要下载的图片")
        return False
    
    print(f"找到 {len(matches)} 个图片需要下载")
    print("-" * 50)
    
    # 下载图片并替换URL
    updated_content = content
    success_count = 0
    
    for index, (alt_text, url) in enumerate(matches, 1):
        filename = download_image(url, images_dir, index)
        
        if filename:
            # 替换图片引用
            old_ref = f'![{alt_text}]({url})'
            new_ref = f'![{alt_text}](./images/{filename})'
            updated_content = updated_content.replace(old_ref, new_ref)
            success_count += 1
        
        # 添加小延迟，避免请求过快
        time.sleep(0.5)
    
    # 保存更新后的文件
    with open(markdown_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("-" * 50)
    print(f"处理完成!")
    print(f"✓ 成功下载: {success_count} 个图片")
    print(f"✓ 失败: {len(matches) - success_count} 个图片")
    print(f"✓ 图片保存在: {images_dir}/ 目录")
    print(f"✓ 已更新文件: {markdown_file}")
    
    return success_count > 0

def git_commit_and_push():
    """提交并推送到GitHub"""
    try:
        print("\n开始Git操作...")
        
        # 添加文件
        subprocess.run(['git', 'add', '从想法到落地.md'], check=True)
        subprocess.run(['git', 'add', 'images/'], check=True)
        
        # 提交
        commit_message = "更新文档：下载图片到本地并更新引用路径"
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        print("✓ Git提交成功")
        
        # 推送
        subprocess.run(['git', 'push'], check=True)
        print("✓ 推送到GitHub成功")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Git操作失败: {e}")
        return False

def main():
    print("=" * 60)
    print("Markdown图片本地化处理脚本")
    print("=" * 60)
    
    # 处理Markdown文件
    success = process_markdown_file()
    
    if success:
        print("\n" + "=" * 60)
        # 询问是否提交到Git
        while True:
            choice = input("是否提交更改并推送到GitHub? (y/n): ").strip().lower()
            if choice in ['y', 'yes']:
                git_commit_and_push()
                break
            elif choice in ['n', 'no']:
                print("跳过Git操作")
                break
            else:
                print("请输入 y 或 n")
    
    print("\n脚本执行完成!")

if __name__ == "__main__":
    main()
