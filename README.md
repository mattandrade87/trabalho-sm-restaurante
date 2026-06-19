# Trabalho Final - Sistemas Móveis

App de uma lanchonete feito em React Native (Expo), com o backend em C# (ASP.NET Core 8) e banco de dados PostgreSQL no Supabase.

O app tem três tipos de usuário (cliente, cozinha e admin), e cada um tem suas próprias telas.

Uma coisa importante do trabalho: o app não acessa o banco direto. Ele só conversa com a API em C#, e é a API que fala com o Supabase.

## Tecnologias

Backend:
- C# com ASP.NET Core 8 (API REST)
- Entity Framework Core para acessar o banco
- Login com JWT e senha guardada com BCrypt
- PostgreSQL (Supabase)

Frontend:
- React Native com Expo
- React Navigation para as telas
- Context API para guardar o usuário logado
- AsyncStorage para salvar o login no celular
- expo-image-picker para a foto de perfil

## Como funciona

O usuário faz login, a API confere a senha e devolve um token (JWT). O app guarda esse token e manda ele em toda requisição. A API olha o token para saber quem é o usuário e qual o perfil dele, e libera só o que aquele perfil pode usar.

O app nunca fala com o banco direto, só com a API.

## O que cada perfil faz

Cliente:
- vê o cardápio (com busca e filtro por categoria)
- escolhe o tipo de entrega (balcão, mesa ou viagem)
- monta o carrinho e faz o pedido
- acompanha os pedidos, pode cancelar, avaliar e pedir de novo
- edita o perfil (nome, telefone, foto e senha)

Cozinha:
- vê a fila de pedidos (atualiza sozinha de tempos em tempos)
- muda o status do pedido (recebido, em preparo, pronto, entregue)
- vê o histórico dos pedidos já finalizados
- edita o perfil

Admin:
- cadastra, edita e exclui produtos
- liga e desliga a disponibilidade de um produto
- vê o relatório de vendas (por período, mais vendidos, etc.)
- vê a lista de clientes e o histórico de cada um
- edita o perfil

## Organização das pastas

backend/ - a API em C#
- Controllers/ - Auth, Produtos, Pedidos, Perfil, Clientes
- Models/ - as classes que viram tabelas (Usuario, Produto, Pedido, ItemPedido)
- Dtos/ - objetos que entram e saem da API
- Services/ - TokenService, que gera o token JWT
- Data/ - o DbContext e o DbInitializer (cria as tabelas e os dados de teste)

frontend/ - o app
- App.tsx - escolhe a navegação de acordo com o perfil
- src/api.tsx - as chamadas para a API
- src/AuthContext.tsx - guarda o usuário logado
- src/config.tsx - o endereço da API
- src/screens/ - as telas separadas por perfil
- src/navigation/ - a navegação de cada perfil
- src/components/ - componentes reaproveitados (avatar, etc.)

## Como rodar

Backend:
1. Precisa do .NET 8.
2. Crie o arquivo backend/appsettings.Development.json com a conexão do Supabase (o appsettings.json mostra o formato com os campos para preencher).
3. Entre na pasta backend e rode: dotnet run

Frontend:
1. Precisa do Node e do Expo.
2. Entre na pasta frontend e rode: npm install
3. Copie o frontend/.env.example para frontend/.env. Se precisar, mude o endereço da API lá dentro (no emulador do Android já vem http://10.0.2.2:5159).
4. Rode: npx expo start

## Usuários de teste

Já são criados quando a API sobe pela primeira vez. A senha de todos é 123456.

- admin@lanche.com (admin)
- cozinha@lanche.com (cozinha)
- cliente@lanche.com (cliente)
