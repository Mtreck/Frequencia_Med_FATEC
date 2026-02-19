# Frequência Medicina - FATEC

<<<<<<< HEAD
Sistema de gestão de frequência para o curso de Medicina, desenvolvido pelo setor de T.I. da FATEC. O objetivo principal deste aplicativo é permitir que os preceptores das Unidades Básicas de Saúde (UBS) realizem o lançamento da frequência dos alunos de forma ágil e segura, utilizando a leitura de QR Codes individuais portados pelos estudantes.
=======
Sistema de gestão de frequência para o curso de Medicina, desenvolvido para a FATEC. Este aplicativo permite o gerenciamento de UBSs, preceptores e acompanhamento de frequência de alunos.
>>>>>>> 40118c78a8caf366b4e3b11951e22f8c6decc33e

## 🚀 Funcionalidades Principais

- **Leitura de QR Code**: O preceptor utiliza o aplicativo para ler o QR Code do crachá ou celular do aluno.
- **Registro de Frequência**: Lançamento automático da presença com geolocalização e carimbo de tempo.
- **Gestão de Preceptores e UBS**: Cadastro e vinculação de preceptores às suas respectivas unidades de saúde.
- **Histórico de Frequência**: Acompanhamento da assiduidade dos alunos em tempo real.

## 🛠 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

- **React Native** com **Expo** (SDK 54)
- **TypeScript**
- **Expo Router** (Navegação moderna baseada em arquivos)
- **Firebase** (Authentication, Firestore) para backend e banco de dados em tempo real.
- **React Navigation**
- **Expo Constants** (Gerenciamento seguro de variáveis de ambiente)

## 📂 Estrutura do Projeto

A estrutura principal do projeto é organizada da seguinte forma:

```
/
├── app/                  # Rotas e telas da aplicação (Expo Router)
├── assets/               # Imagens, ícones e fontes
├── components/           # Componentes reutilizáveis de interface
├── constants/            # Temas, cores e constantes globais
├── hooks/                # Custom React Hooks para lógica reutilizável
├── scripts/              # Scripts de automação e utilitários
└── src/                  # Regras de negócio e serviços
    └── components/services/ # Configurações de serviços externos (Firebase)
```

## ⚙️ Pré-requisitos

Para rodar este projeto, você precisará de:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Git](https://git-scm.com/)
- Aplicativo **Expo Go** no seu celular (Android ou iOS) ou um emulador configurado.

## 🔧 Instalação e Configuração

1. Clone o repositório:

   ```bash
   git clone https://github.com/Mtreck/Frequencia_Med_FATEC.git
   cd Frequencia_Med_FATEC
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env` na raiz do projeto e preencha com as credenciais do Firebase (utilize o `.env.example` como base).

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   ...
   ```

## ▶️ Executando o Projeto

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Isso abrirá o Metro Bundler. Você pode:
- Escanear o QR Code com o app **Expo Go** (Android/iOS).
- Pressionar `a` para abrir no emulador Android.
- Pressionar `i` para abrir no simulador iOS.
- Pressionar `w` para abrir no navegador.

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por **Mtreck** - Setor de Tecnologia da Informação.
