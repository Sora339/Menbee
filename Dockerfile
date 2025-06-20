# ビルド用ステージ
FROM node:22-alpine AS builder

WORKDIR /app

RUN rm -rf .next node_modules package-lock.json

# OpenSSLと必要なパッケージをインストール
RUN apk add --no-cache \
    openssl \
    ca-certificates

# package.json と package-lock.json をコピー
COPY package.json package-lock.json ./

# 全ての依存関係をインストール
RUN npm install

# Prismaスキーマをコピー
COPY prisma ./prisma/

# Prisma Clientを生成
RUN npx prisma generate

# ソースコードをコピー
COPY . .

# Next.jsアプリをビルド
RUN npm run build

# 実行用ステージ
FROM node:22-alpine

WORKDIR /app

# OpenSSLと基本的なツールをインストール
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    curl \
    procps \
    && rm -rf /var/cache/apk/*

# ビルド結果をすべてコピー
COPY --from=builder /app ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1


# .envファイルが存在する場合は読み込み
RUN if [ -f .env ]; then \
    echo "Loading .env file..."; \
    export $(cat .env | grep -v '^#' | xargs); \
    fi

# ヘルスチェック用のエンドポイントを追加
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]