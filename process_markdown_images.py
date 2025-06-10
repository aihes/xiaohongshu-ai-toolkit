#!/usr/bin/env python3
"""
Markdown图片处理脚本
功能：
1. 下载Markdown文件中的所有图片到本地images目录
2. 更新图片引用路径
3. 提交更改到Git仓库
"""

import os
import re
import requests
import hashlib
import time
from urllib.parse import urlparse
from pathlib import Path
import subprocess
import sys

class MarkdownImageProcessor:
    def __init__(self, markdown_file, images_dir="images"):
        self.markdown_file = markdown_file
        self.images_dir = images_dir
        self.downloaded_images = {}
        
        # 创建images目录
        Path(self.images_dir).mkdir(exist_ok=True)
        
    def get_file_extension_from_url(self, url):
        """从URL获取文件扩展名"""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        # 常见图片扩展名
        extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']
        for ext in extensions:
            if ext in path:
                return ext
        
        # 默认返回.png
        return '.png'
    
    def generate_filename(self, url, content=None):
        """生成唯一的文件名"""
        # 使用URL的hash作为文件名，确保唯一性
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        extension = self.get_file_extension_from_url(url)
        
        # 如果有内容，也加入hash计算，确保相同URL但不同内容的图片不会冲突
        if content:
            content_hash = hashlib.md5(content).hexdigest()[:8]
            return f"{url_hash}_{content_hash}{extension}"
        
        return f"{url_hash}{extension}"
    
    def download_image(self, url, max_retries=3):
        """下载图片"""
        print(f"正在下载: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=30)
                response.raise_for_status()
                
                # 生成文件名
                filename = self.generate_filename(url, response.content)
                filepath = os.path.join(self.images_dir, filename)
                
                # 保存图片
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                print(f"✓ 下载成功: {filename}")
                return filename
                
            except requests.exceptions.RequestException as e:
                print(f"✗ 下载失败 (尝试 {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)  # 等待2秒后重试
                else:
                    print(f"✗ 最终下载失败: {url}")
                    return None
    
    def extract_image_urls(self, content):
        """提取Markdown中的图片URL"""
        # 匹配 ![alt](url) 格式的图片
        pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        matches = re.findall(pattern, content)
        
        image_urls = []
        for alt_text, url in matches:
            # 只处理网络图片URL
            if url.startswith('http'):
                image_urls.append((alt_text, url))
        
        return image_urls
    
    def process_markdown(self):
        """处理Markdown文件"""
        if not os.path.exists(self.markdown_file):
            print(f"错误: 文件 {self.markdown_file} 不存在")
            return False
        
        # 读取Markdown文件
        with open(self.markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取图片URL
        image_urls = self.extract_image_urls(content)
        
        if not image_urls:
            print("没有找到需要下载的图片")
            return True
        
        print(f"找到 {len(image_urls)} 个图片需要下载")
        
        # 下载图片并更新内容
        updated_content = content
        success_count = 0
        
        for alt_text, url in image_urls:
            filename = self.download_image(url)
            if filename:
                # 更新图片引用路径
                old_pattern = f'![{re.escape(alt_text)}]({re.escape(url)})'
                new_pattern = f'![{alt_text}](./{self.images_dir}/{filename})'
                updated_content = re.sub(old_pattern, new_pattern, updated_content)
                success_count += 1
            else:
                print(f"警告: 图片下载失败，保留原始URL: {url}")
        
        # 保存更新后的Markdown文件
        with open(self.markdown_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        print(f"\n处理完成:")
        print(f"- 成功下载: {success_count} 个图片")
        print(f"- 失败: {len(image_urls) - success_count} 个图片")
        print(f"- 图片保存在: {self.images_dir}/ 目录")
        print(f"- Markdown文件已更新: {self.markdown_file}")
        
        return success_count > 0
    
    def git_commit_changes(self, commit_message=None):
        """提交更改到Git"""
        if not commit_message:
            commit_message = f"更新Markdown文件图片引用，下载图片到本地{self.images_dir}目录"
        
        try:
            # 检查是否在Git仓库中
            subprocess.run(['git', 'status'], check=True, capture_output=True)
            
            # 添加文件到Git
            subprocess.run(['git', 'add', self.markdown_file], check=True)
            subprocess.run(['git', 'add', self.images_dir], check=True)
            
            # 提交更改
            subprocess.run(['git', 'commit', '-m', commit_message], check=True)
            
            print(f"\n✓ Git提交成功: {commit_message}")
            
            # 询问是否推送到远程仓库
            push = input("是否推送到远程仓库? (y/N): ").strip().lower()
            if push in ['y', 'yes']:
                subprocess.run(['git', 'push'], check=True)
                print("✓ 推送到远程仓库成功")
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"✗ Git操作失败: {e}")
            return False
        except FileNotFoundError:
            print("✗ Git未安装或不在PATH中")
            return False

def main():
    # 默认处理当前目录下的"从想法到落地.md"文件
    markdown_file = "从想法到落地.md"
    
    # 如果提供了命令行参数，使用指定的文件
    if len(sys.argv) > 1:
        markdown_file = sys.argv[1]
    
    print(f"开始处理文件: {markdown_file}")
    print("=" * 50)
    
    # 创建处理器实例
    processor = MarkdownImageProcessor(markdown_file)
    
    # 处理Markdown文件
    success = processor.process_markdown()
    
    if success:
        print("\n" + "=" * 50)
        # 询问是否提交到Git
        commit = input("是否提交更改到Git仓库? (y/N): ").strip().lower()
        if commit in ['y', 'yes']:
            processor.git_commit_changes()
    
    print("\n处理完成!")

if __name__ == "__main__":
    main()
