import { Section, Cell, List, Spinner } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import { Link } from "@/components/Link/Link.tsx";
import { Page } from "@/components/Page.tsx";
import { useProfilesContext } from "@/context/ProfilesContext.tsx";

export const IndexPage: FC = () => {
  const { profiles, telegramId } = useProfilesContext();

  return (
    <Page back={false}>
      <List>
        <Section header="Добро пожаловать, здесь вы можете управлять своей анкетой">
          <Link to="/profile-create">
            <Cell subtitle="Создать черновик  своей анкеты">
              Создать анкету
            </Cell>
          </Link>
        </Section>

        {/* Debug information */}
        <Section header="Информация о профилях">
          <Cell subtitle={`Telegram ID: ${telegramId}`}>Ваш ID</Cell>
          <Cell
            subtitle={`Статус: ${
              profiles.isLoading
                ? "Загрузка..."
                : profiles.isError
                ? "Ошибка"
                : "Готово"
            }`}
          >
            API статус
          </Cell>
          {profiles.isError && (
            <Cell
              subtitle={`${profiles.error?.message || "Неизвестная ошибка"}`}
            >
              Ошибка API
            </Cell>
          )}
          {profiles.data && (
            <Cell subtitle={`Найдено: ${profiles.data.length} анкет`}>
              Ваши анкеты
            </Cell>
          )}
          {profiles.isLoading && (
            <Cell>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Spinner size="s" />
                <span>Загружаем ваши анкеты...</span>
              </div>
            </Cell>
          )}
        </Section>

        {/* Show existing profiles if any */}
        {profiles.data && profiles.data.length > 0 && (
          <Section header="Ваши анкеты">
            {profiles.data.map((profile) => (
              <Cell
                key={profile.id}
                subtitle={`${profile.location.city}, ${
                  profile.location.country
                } • ${profile.isActive ? "Активна" : "Неактивна"}`}
              >
                {profile.name}
              </Cell>
            ))}
          </Section>
        )}
      </List>
    </Page>
  );
};
