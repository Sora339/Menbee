FROM node:22-alpine

WORKDIR /app

# OpenSSL 3.0をインストール（bookworm-slimはデフォルトでOpenSSL 3.0を使用）
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# package.json と package-lock.json をコピー
COPY package.json package-lock.json ./
RUN npm install

# prisma/schema.prisma をコピー
COPY prisma/ ./prisma/

# Prisma Client を生成
RUN npx prisma generate

# 残りのソースコードをコピー
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]