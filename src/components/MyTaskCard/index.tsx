import React, { useContext } from 'react';
import { Logo } from '../../UI/Logo';
import styles from './styles.module.scss';
import {
  CalendarIcon,
  GeoIcon,
  RouteIcon,
  ShevronDownIcon,
} from '../../assets/icons';
import { Button } from '../../UI/Button';
import classNames from 'classnames';
import { useWindowResize } from '../../hooks/useWindowResize';
import { AuthContext } from '../../modules/auth';
import { useDismissMyTasksMutation } from '../../modules/tasks';

interface MyTaskCardProps {
  id: number;
  organization: {
    name: string;
    avatarURL?: string;
  };
  description: string;
  arrived: boolean;
  paymentDescription: string;
  medCard: boolean;
  specialConditions: string;
  address: string;
  post: string;
  date: string;
  longtitude: string;
  latitude: string;
  isClosedTask?: boolean;
  isOpenDefault?: boolean;
  status: string;
}

export const MyTaskCard: React.FC<MyTaskCardProps> = ({
  id,
  medCard,
  address,
  date,
  description,
  paymentDescription,
  organization,
  specialConditions,
  arrived,
  post,
  isClosedTask = false,
  isOpenDefault = false,
  longtitude,
  latitude,
  status,
}) => {
  const authContext = useContext(AuthContext);
  const { size } = useWindowResize();
  const [isOpen, setIsOpen] = React.useState<boolean>(isOpenDefault);
  const { mutateAsync: dissmiss } = useDismissMyTasksMutation(
    authContext.token
  );
  const onToggleMobile = () => {
    if (size <= 480) {
      setIsOpen((prev) => !prev);
    }
  };

  const [isRouteHovered, setIsRouteHovered] = React.useState<boolean>(false);

  const onMouseEnter = () => {
    setIsRouteHovered(true);
  };
  const onMouseLeave = () => {
    setIsRouteHovered(false);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={classNames(
          {
            [styles['header--closed']]: isClosedTask,
            [styles['header--default']]: !isClosedTask,
          },
          styles.header
        )}
        onClick={() => {
          onToggleMobile();
        }}
      >
        {isClosedTask ? (
          <div className={styles.closed__header}>
            Ваше ближайшее задание {isClosedTask ? `(${status})` : null}
          </div>
        ) : (
          <div className={styles.default__header}>
            {organization.avatarURL ? (
              <img className={styles.logo} src={organization.avatarURL} />
            ) : (
              <Logo variant="secondary" size="sm" />
            )}
            {organization.name}
            <div className={styles.status}>(Статус: {status})</div>
          </div>
        )}
        {!isClosedTask && size <= 480 ? (
          <div className={classNames({ [styles.rotated]: isOpen })}>
            <ShevronDownIcon width={12} height={8} fill="#133552" />
          </div>
        ) : null}
      </div>
      <div className={styles.main}>
        <div className={styles.main__header}>
          <div className={styles.main__date}>
            <CalendarIcon width={20} height={20} fill="#87A2BE" />
            {date}
          </div>
          <div className={styles.main__post}>{post}</div>
        </div>
        {isClosedTask ? (
          <div className={styles.organization}>
            {organization.avatarURL ? (
              <img className={styles.logo} src={organization.avatarURL} />
            ) : (
              <Logo variant="secondary" size="sm" />
            )}
            {organization.name}
          </div>
        ) : null}
        <div className={styles.grid}>
          <div className={styles.col}>
            <div className={styles.col__name}>Описание</div>
            <div className={styles.col__value}>{description}</div>
          </div>
          {isClosedTask || (isOpen && size <= 480) || size > 480 ? (
            <>
              <div className={styles.col}>
                <div className={styles.col__name}>Отметка о прибытии</div>
                <div
                  className={classNames(
                    styles.col__value,
                    styles['col__value--bool']
                  )}
                >
                  {arrived ? 'Да' : 'Нет'}
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.col__name}>Оплата</div>
                <div className={styles.col__value}>{paymentDescription}</div>
              </div>
              <div className={styles.col}>
                <div className={styles.col__name}>Медкнижка</div>
                <div
                  className={classNames(
                    styles.col__value,
                    styles['col__value--bool']
                  )}
                >
                  {medCard ? 'Да' : 'Нет'}
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.col__name}>Особые условия</div>
                <div className={styles.col__value}>{specialConditions}</div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.geo}>
          <GeoIcon width={12} height={20} fill="#FFD480" />
          {address}
        </div>
        <div className={styles.controlls}>
          <a
            href={`https://yandex.ru/maps/?ll=${longtitude}%2C${latitude}&z=15&mode=routes&rtext=~${latitude}%2C${longtitude}&rtt=auto&ruri=~`}
            target="_blank"
            rel="noreferrer"
          >
            <button
              className={styles.route}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <RouteIcon
                width={20}
                height={20}
                fill={isRouteHovered ? '#3C2D96' : '#3BF1E2'}
              />
            </button>
          </a>
          <Button onClick={async () => await dissmiss(id)} variant="outlined">
            Отменить
          </Button>
        </div>
      </div>
    </div>
  );
};
