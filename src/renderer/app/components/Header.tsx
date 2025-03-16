'use client';

import styled from 'styled-components';
import { BellIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const HeaderContainer = styled.header`
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

export default function Header() {
  return (
    <HeaderContainer>
      <Logo>
        <span>ABI</span>
      </Logo>
      <Nav>
        <a href="#" className="active">Dashboard</a>
        <a href="#">Analisi</a>
        <a href="#">Report</a>
        <a href="#">Impostazioni</a>
      </Nav>
      <UserSection>
        <BellIcon className="notification h-6 w-6" />
        <ChatBubbleLeftIcon className="chat h-6 w-6" />
        <div className="avatar"></div>
      </UserSection>
    </HeaderContainer>
  );
} 