"use client";

import styled from 'styled-components';
import { BellIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  width: 100%;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a73e8;
  
  img {
    width: 32px;
    height: 32px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  a {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    transition: all 0.3s ease;

    &:hover, &.active {
      background-color: #000;
      color: #fff;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  .notification {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .chat {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e0e0e0;
  }
`;

const Main = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>ForSelle Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Container>
          <Header>
            <Logo>
              <span>ForSelle</span>
            </Logo>
            <Nav>
              <a href="#" className="active">Dashboard</a>
              <a href="#">Leads</a>
              <a href="#">Workflows</a>
              <a href="#">Sales</a>
              <a href="#">Reports</a>
            </Nav>
            <UserSection>
              <BellIcon className="notification h-6 w-6" />
              <ChatBubbleLeftIcon className="chat h-6 w-6" />
              <div className="avatar"></div>
            </UserSection>
          </Header>
          <Main>{children}</Main>
        </Container>
      </body>
    </html>
  );
}