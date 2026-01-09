import PyPDF2

# Extract full PDF content
pdf_path = r'c:\Users\81704\OneDrive\デスクトップ\jikken\アプリ対策\マッチングアプリと恋愛におけるメッセージ戦略の統合分析.pdf'
with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text1 = ''
    for page in reader.pages:
        text1 += page.extract_text()

pdf_path2 = r'c:\Users\81704\OneDrive\デスクトップ\jikken\アプリ対策\モテ戦略に関する総合ブリーフィング：ようしゅチャンネルの戦術分析.pdf'
with open(pdf_path2, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text2 = ''
    for page in reader.pages:
        text2 += page.extract_text()

# Save as extraction file
with open(r'c:\Users\81704\OneDrive\デスクトップ\jikken\dating-app\pdf_content.txt', 'w', encoding='utf-8') as f:
    f.write('=== マッチングアプリと恋愛におけるメッセージ戦略の統合分析 ===\n\n')
    f.write(text1)
    f.write('\n\n=== モテ戦略に関する総合ブリーフィング ===\n\n')
    f.write(text2)

print('PDF content extracted successfully')
print(f'PDF1 length: {len(text1)} chars')
print(f'PDF2 length: {len(text2)} chars')
