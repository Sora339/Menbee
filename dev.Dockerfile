FROM node:22-alpine

WORKDIR /app

# OpenSSL 3.0をインストール（Alpine用）
RUN apk add --no-cache \
    openssl \
    ca-certificates

# package.json と package-lock.json をコピー
COPY package.json package-lock.json ./
RUN npm install

# prisma/schema.prisma をコピー
COPY prisma/ ./prisma/

# Prisma Client を生成
RUN npx prisma generate

# 残りのソースコードをコピー
COPY . .

# 開発環境でPrismaクライアントを確実に生成
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]