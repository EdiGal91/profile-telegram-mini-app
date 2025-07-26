import { Section, Cell, List, Spinner } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import { Link } from "@/components/Link/Link.tsx";
import { Page } from "@/components/Page.tsx";
import { useProfilesContext } from "@/context/ProfilesContext.tsx";
import { useNavigate } from "react-router-dom";
import { useCreateDraftProfile } from "@/hooks/useProfiles";

export const IndexPage: FC = () => {
  const { profiles, telegramId } = useProfilesContext();
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);
  const hasDraft = !!draftProfile;
  const navigate = useNavigate();
  const createDraftProfile = useCreateDraftProfile();

  const handleCreateProfile = async () => {
    if (!hasDraft) {
      try {
        await createDraftProfile.mutateAsync();
      } catch (e) {
        // Optionally show error to user
        return;
      }
    }
    navigate("/profile-create");
  };

  return (
    <Page back={false}>
      <List>
        <Section header="Добро пожаловать, здесь вы можете управлять своей анкетой">
          {hasDraft ? (
            <Link to="/profile-create">
              <Cell
                subtitle={`Продолжить черновик: ${
                  draftProfile?.name || "Без названия"
                }`}
              >
                Продолжить анкету
              </Cell>
            </Link>
          ) : (
            <Cell
              subtitle="Создать черновик своей анкеты"
              onClick={handleCreateProfile}
              interactiveAnimation="opacity"
            >
              Создать анкету
            </Cell>
          )}
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
            <Cell
              subtitle={`Найдено: ${
                profiles.data.filter((p) => !p.isDraft).length
              } анкет${
                profiles.data.filter((p) => p.isDraft).length > 0
                  ? ` + 1 черновик`
                  : ""
              }`}
            >
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

        {/* Show only completed profiles */}
        {profiles.data &&
          profiles.data.filter((profile) => !profile.isDraft).length > 0 && (
            <Section header="Ваши анкеты">
              {profiles.data
                .filter((profile) => !profile.isDraft)
                .map((profile) => (
                  <Cell
                    key={profile._id}
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
