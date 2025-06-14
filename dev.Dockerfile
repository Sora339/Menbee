FROM node:22-bookworm-slim

WORKDIR /app



# OpenSSLと必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# package.json と package-lock.json をコピー
COPY package.json package-lock.json ./

RUN npm install

# ソースコードをコピー
COPY . .

# Prismaスキーマが存在する場合のみgenerate実行
RUN if [ -f "prisma/schema.prisma" ] || [ -f "schema.prisma" ]; then \
    npx prisma generate; \
    fi

EXPOSE 3000

CMD ["npm", "run", "dev"]