import { Section, Cell, Image, List } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import { Link } from "@/components/Link/Link.tsx";
import { Page } from "@/components/Page.tsx";

import tonSvg from "./ton.svg";

export const IndexPage: FC = () => {
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
      </List>
    </Page>
  );
};
