"use client";

import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button, Space, Typography } from "antd";
import { LoginOutlined, LogoutOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import AppLayout from "@/components/AppLayout";

const { Title, Text } = Typography;

export default function SettingsPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <AppLayout>
      <main className="settings-page">
        <section className="settings-hero">
          <Text className="settings-kicker">Account</Text>
          <Title className="settings-title">Настройки</Title>
          <Text className="settings-copy">
            Вход нужен для профиля и будущей синхронизации. Текущие тренировки пока остаются в локальном хранилище этого браузера.
          </Text>
        </section>

        <section className="settings-panel">
          {clerkEnabled ? <ClerkSettingsPanel /> : <ClerkSetupPanel />}
        </section>

        <section className="settings-panel settings-panel--compact">
          <Text className="settings-kicker">Storage</Text>
          <Title level={3}>Локальные данные</Title>
          <Text type="secondary">
            Cardio, Gym и план тренировок сейчас сохраняются локально через Zustand/localStorage. Авторизация не меняет существующие записи.
          </Text>
        </section>
      </main>
    </AppLayout>
  );
}

function ClerkSettingsPanel() {
  const { isSignedIn, user } = useUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;

  if (isSignedIn) {
    return (
      <div className="settings-auth-card">
        <UserButton />
        <div>
          <Title level={3}>{user?.fullName || user?.username || "Профиль"}</Title>
          <Text type="secondary">{primaryEmail || "Аккаунт Clerk"}</Text>
        </div>
        <SignOutButton>
          <Button danger size="large" icon={<LogoutOutlined />}>
            Выйти
          </Button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <div className="settings-auth-card">
      <SafetyCertificateOutlined />
      <div>
        <Title level={3}>Войди в аккаунт</Title>
        <Text type="secondary">
          После входа здесь появится профиль, email и кнопка выхода.
        </Text>
      </div>
      <Space wrap>
        <SignInButton mode="modal">
          <Button type="primary" size="large" icon={<LoginOutlined />}>
            Войти
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="large">Создать аккаунт</Button>
        </SignUpButton>
      </Space>
    </div>
  );
}

function ClerkSetupPanel() {
  return (
    <div className="settings-auth-card">
      <SafetyCertificateOutlined />
      <div>
        <Title level={3}>Clerk не настроен</Title>
        <Text type="secondary">
          Добавь `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` и `CLERK_SECRET_KEY` в `.env.local`, чтобы включить настоящий вход и выход.
        </Text>
      </div>
      <Button size="large" disabled>
        Вход выключен
      </Button>
    </div>
  );
}
