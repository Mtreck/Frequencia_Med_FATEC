# Frequência Medicina - FATEC

Sistema de gestão de frequência para o curso de Medicina, desenvolvido para a FATEC. Este aplicativo permite o gerenciamento de UBSs, preceptores e acompanhamento de frequência de alunos.

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

- **React Native** com **Expo** (SDK 54)
- **TypeScript**
- **Expo Router** (Navegação baseada em arquivos)
- **Firebase** (Authentication, Firestore)
- **React Navigation**
- **Expo Constants** (Gerenciamento de variáveis de ambiente)

## 📂 Estrutura de Pastas

A estrutura principal do projeto é organizada da seguinte forma:

```
/
├── app/                  # Rotas e telas da aplicação (Expo Router)
├── assets/               # Imagens e fontes
├── components/           # Componentes reutilizáveis
│   └── services/         # Serviços como configuração do Firebase
├── constants/            # Constantes globais e temas
├── hooks/                # Custom React Hooks
├── scripts/              # Scripts utilitários
└── src/                  # Código fonte adicional
```

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Git](https://git-scm.com/)
- Aplicativo **Expo Go** no seu celular (Android ou iOS) ou um emulador configurado.

## 🔧 Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Mtreck/Frequencia_Med_FATEC.git
   cd Frequencia_Med_FATEC
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

## 🔐 Configuração das Variáveis de Ambiente

Este projeto utiliza o Firebase e requer chaves de API para funcionar.

1. Crie um arquivo `.env` na raiz do projeto.
2. Copie o conteúdo do arquivo `.env.example` para o `.env`.
3. Preencha as variáveis com as suas credenciais do Firebase:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
   ```

> **Nota:** Nunca suba o arquivo `.env` para o repositório público. Ele já está listado no `.gitignore`.

## ▶️ Como Rodar o Projeto

Após configurar as variáveis de ambiente, inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Isso abrirá uma interface onde você pode:
- Escanear o QR Code com o app **Expo Go** (Android/iOS).
- Pressionar `a` para abrir no emulador Android.
- Pressionar `i` para abrir no simulador iOS.
- Pressionar `w` para abrir no navegador.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por **Mtreck** e equipe FATEC.

---

*Este README foi gerado automaticamente para publicação profissional.*
