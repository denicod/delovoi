import React, { useContext } from 'react';
import { Title } from '../../../../UI/Title';
import { ControllBar } from '../ControllBar';
import { type Col, SortBar } from '../SortBar';
import { TaskCard } from '../TaskCard';
import styles from './styles.module.scss';
import { useWindowResize } from '../../../../hooks/useWindowResize';
import { useTabs } from '../../../../hooks/useTabs';
import { Map, Placemark, YMaps, Clusterer } from '@pbe/react-yandex-maps';
import { formatWorkHours } from '../../../../helpers/formatWorkHours';
import { TaskCardMobile } from '../TaskCardMobile';
import { Button } from '../../../../UI/Button';
import { appConfig } from '../../../../app-config';
import {
  useAcceptTaskMutation,
  useDismissMyTasksMutation,
  useGetTasksQuery,
  useGetTasksPlacemarks,
} from '../../../../modules/tasks';
import { AuthContext } from '../../../../modules/auth';
import { type Pair } from '../../../../UI/Select';
import { queryClient } from '../../../../index';

export const Content: React.FC = () => {
  const { size } = useWindowResize();
  const authContext = useContext(AuthContext);
  const [date, setDate] = React.useState<[Date, Date] | null>(null);
  const [vacancy, setVacancy] = React.useState<Pair>({
    key: 'all',
    value: 'Все вакансии',
  });
  const [sort, setSort] = React.useState<Col>();
  const { activeTab: activeViewTab, onTabChange: setActiveViewTab } =
    useTabs(0);
  const {
    data,
    refetch: refetchTasks,
    fetchNextPage,
    hasNextPage,
  } = useGetTasksQuery(
    authContext.token,
    date ?? undefined,
    vacancy.key === 'all' ? undefined : vacancy.key,
    sort
  );
  const { mutateAsync: acceptTask } = useAcceptTaskMutation();
  const { mutateAsync: dismissTask } = useDismissMyTasksMutation(
    authContext.token
  );

  const onSelectVacancy = async (pair: Pair) => {
    setVacancy({ ...pair });
    await queryClient.invalidateQueries(['tasks']);
    await refetchTasks({});
  };
  const onDateChange = async (range: [Date, Date] | null) => {
    if (!range) {
      setDate(null);
      await queryClient.invalidateQueries(['tasks']);
      await refetchTasks();
      return;
    }

    const start = range[0].getTime() < Date.now() ? new Date() : range[0];
    const end = range[1].getTime() < Date.now() ? new Date() : range[1];

    setDate([start, end]);
    await queryClient.invalidateQueries(['tasks']);
    await refetchTasks();
  };

  const getPlacemarksQuery = useGetTasksPlacemarks(authContext.token);
  const cities = getPlacemarksQuery.data
    ? getPlacemarksQuery.data.data.placemarks
    : [];

  const getPointData = function (index: number) {
    return {
      clusterCaption: 'placemark <strong>2</strong>',
      hintContent:
        String(cities[index].price) +
        ' ₽/' +
        String(cities[index].task_type) +
        ' или ' +
        String(cities[index].sum_shift) +
        '₽/день',
      balloonContentHeader:
        '<div style="background: #E8EDF3; padding: 12px 16px;">' +
        '<b>' +
        String(cities[index].customer_name) +
        '</b>' +
        '</div>',
      balloonContentBody:
        '<div style="display:flex;padding:5px 0; align-items:center;">' +
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.65 1C5.56716 1 5.5 1.06716 5.5 1.15V2.5H2.65C1.73872 2.5 1 3.23874 1 4.15V7V8.5V17.35C1 18.2613 1.73874 19 2.65 19H17.35C18.2613 19 19 18.2613 19 17.35V8.5V7V4.15C19 3.23872 18.2613 2.5 17.35 2.5H14.5V1.15C14.5 1.06716 14.4328 1 14.35 1H13.15C13.0672 1 13 1.06716 13 1.15V2.5H7V1.15C7 1.06716 6.93284 1 6.85 1H5.65ZM17.5 7V4.15C17.5 4.06716 17.4328 4 17.35 4H14.5V5.35C14.5 5.43284 14.4328 5.5 14.35 5.5H13.15C13.0672 5.5 13 5.43284 13 5.35V4H7V5.35C7 5.43284 6.93284 5.5 6.85 5.5H5.65C5.56716 5.5 5.5 5.43284 5.5 5.35V4H2.65C2.56716 4 2.5 4.06716 2.5 4.15V7H17.5ZM2.5 8.5V17.35C2.5 17.4328 2.56716 17.5 2.65 17.5H17.35C17.4328 17.5 17.5 17.4328 17.5 17.35V8.5H2.5ZM7 10.75C7 11.1642 6.66421 11.5 6.25 11.5C5.83579 11.5 5.5 11.1642 5.5 10.75C5.5 10.3358 5.83579 10 6.25 10C6.66421 10 7 10.3358 7 10.75ZM10 11.5C10.4142 11.5 10.75 11.1642 10.75 10.75C10.75 10.3358 10.4142 10 10 10C9.58579 10 9.25 10.3358 9.25 10.75C9.25 11.1642 9.58579 11.5 10 11.5ZM14.5 10.75C14.5 11.1642 14.1642 11.5 13.75 11.5C13.3358 11.5 13 11.1642 13 10.75C13 10.3358 13.3358 10 13.75 10C14.1642 10 14.5 10.3358 14.5 10.75ZM13.75 14.5C14.1642 14.5 14.5 14.1642 14.5 13.75C14.5 13.3358 14.1642 13 13.75 13C13.3358 13 13 13.3358 13 13.75C13 14.1642 13.3358 14.5 13.75 14.5ZM10.75 13.75C10.75 14.1642 10.4142 14.5 10 14.5C9.58579 14.5 9.25 14.1642 9.25 13.75C9.25 13.3358 9.58579 13 10 13C10.4142 13 10.75 13.3358 10.75 13.75ZM6.25 14.5C6.66421 14.5 7 14.1642 7 13.75C7 13.3358 6.66421 13 6.25 13C5.83579 13 5.5 13.3358 5.5 13.75C5.5 14.1642 5.83579 14.5 6.25 14.5Z" fill="#87A2BE"></path></svg>' +
        '<div style="font-weight: 500; font-size: 14px; line-height: 16px; color: #3C2D96; margin-left:15px;">' +
        String(cities[index].order_date) +
        ' ' +
        String(cities[index].time_start) +
        ' - ' +
        String(cities[index].time_end) +
        '</div>' +
        '</div>' +
        '<div style="padding: 15px 0;display:flex; justify-content: space-between;">' +
        '<span class="styles_post__nqJW9" style="margin-right: 30px; background: #E8EDF3;">' +
        String(cities[index].vacancy) +
        '</span>' +
        ' ' +
        String(cities[index].price) +
        ' ₽/' +
        String(cities[index].task_type) +
        ' или ' +
        String(cities[index].sum_shift) +
        '₽/день' +
        '</div>',
      balloonContentFooter:
        '<div style="padding: 10px 0;display:flex; justify-content: space-between;border-top: 1px solid #DEE3E8;gap:12px;">' +
        '<div style="display:flex;gap:10px;align-items:center;">' +
        '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 0C2.6856 0 0 2.78799 0 6.2414C0 12.2126 6 20 6 20C6 20 12 12.2114 12 6.2414C12 2.78924 9.3144 0 6 0ZM6 9.69481C4.2096 9.69481 2.76 8.18261 2.76 6.3177C2.76 4.45278 4.2096 2.94059 6 2.94059C7.788 2.94059 9.2388 4.45278 9.2388 6.3177C9.2388 8.18261 7.788 9.69481 6 9.69481Z" fill="#FFD480"></path></svg>' +
        '<div style="color: #000;">' +
        String(cities[index].address_full) +
        '</div>' +
        '</div>' +
        '<div style="display: flex; flex-direction: row; align-items: center; padding: 10px 10px; gap: 8px;border: 2px solid #3C2D96;border-radius:8px;">' +
        '<a href="/"><div style="min-width:103px; height:20px;font-size:14px;text-align:center;color: #3C2D96;">Взять в работу</div></a>' +
        '</div>' +
        '</div>',
      iconCaption: String(cities[index].customer_name),
    };
  };

  const getPointOptions = function (index: number) {
    return {
      iconLayout: 'default#image',
      iconImageHref:
        'https://api.delovoi.me/images/logo/' +
        String(cities[index].customer_logo),
      iconImageSize: [30, 30],
      openEmptyBalloon: true,
    };
  };

  const onReset = async () => {
    setDate(null);
    setVacancy({
      key: 'all',
      value: 'Все вакансии',
    });

    await queryClient.invalidateQueries(['tasks']);
    await refetchTasks();
  };

  const onSortHandle = async (col: Col) => {
    setSort(col);
    await queryClient.invalidateQueries(['tasks']);
    await refetchTasks();
  };

  return (
    <div className={styles.wrapper}>
      <Title>Поиск заданий</Title>
      <ControllBar
        onChangeViewClick={(view) => {
          if (view === 'items') setActiveViewTab(0);
          if (view === 'maps') setActiveViewTab(1);
        }}
        onSelect={onSelectVacancy}
        activeSelect={vacancy}
        onDateChange={onDateChange}
        onReset={onReset}
        value={date}
      />

      {activeViewTab === 0 ? (
        <div className={styles.inner}>
          {size > 1024 ? <SortBar active={sort} onSort={onSortHandle} /> : null}
          <div className={styles.list}>
            {size > 992
              ? data?.pages.map((page) =>
                  page.data.map((item, i) => (
                    <TaskCard
                      orderDate={item.order_date}
                      paymentCondition={item.payment}
                      key={`${item.id} ${i}`}
                      organization={{
                        name: item.customer_name,
                        avatarUrl: `${appConfig.imagesPath}${item.customer_logo}`,
                      }}
                      driveway={Boolean(item.driveway)}
                      meals={Boolean(item.meals)}
                      post={item.vacancy}
                      address={item.object}
                      time={formatWorkHours(item.time_start, item.time_end)}
                      paymentRate={`${
                        item.price
                      } ₽/${item.task_type.toLowerCase()} или до ${
                        item.sum_shift
                      } ₽/день`}
                      hasDiscount={false}
                      description={item.description ?? ''}
                      onAccept={async () =>
                        await acceptTask({
                          taskId: item.id,
                          token: authContext.token ?? '',
                          baseId: item.base_id,
                        })
                      }
                      onDismiss={async () => await dismissTask(item.id)}
                    />
                  ))
                )
              : data?.pages.map((page) =>
                  page.data.map((item, i) => (
                    <TaskCardMobile
                      orderDate={item.order_date}
                      paymentCondition={item.payment}
                      key={`${item.id} ${i}`}
                      organization={{
                        name: item.customer_name,
                        avatarUrl: `${appConfig.imagesPath}${item.customer_logo}`,
                      }}
                      post={item.vacancy}
                      address={item.object}
                      time={formatWorkHours(item.time_start, item.time_end)}
                      paymentRate={`${
                        item.price
                      } ₽/${item.task_type.toLowerCase()} или до ${
                        item.sum_shift
                      } ₽/день`}
                      hasDiscount={false}
                      description={item.description ?? ''}
                      onAccept={async () =>
                        await acceptTask({
                          taskId: item.id,
                          token: authContext.token ?? '',
                          baseId: item.base_id,
                        })
                      }
                      driveway={Boolean(item.driveway)}
                      meals={Boolean(item.meals)}
                      onDismiss={async () => await dismissTask(item.id)}
                    />
                  ))
                )}
          </div>
          {hasNextPage ? (
            <div className={styles.loadmore}>
              <div className={styles.loadmore__inner}>
                <Button onClick={async () => await fetchNextPage()}>
                  Загрузить еще
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {activeViewTab === 1 ? (
        <>
          <YMaps>
            <Map
              width="100%"
              height="360px"
              style={{ flex: '1 1 300px', minHeight: '700px' }}
              defaultState={{ center: [55.75, 37.57], zoom: 6 }}
              modules={[
                'geoObject.addon.balloon',
                'geoObject.addon.hint',
                'util.bounds',
                'templateLayoutFactory',
                'layout.ImageWithContent',
              ]}
            >
              <Clusterer
                options={{
                  preset: 'islands#nightClusterIcons',
                  groupByCoordinates: false,
                  minClusterSize: 2,
                  clusterIcons: [
                    {
                      href: 'https://api.delovoi.me/images/logo/logoCluster.png',
                      size: [30, 30],
                      offset: [0, 0],
                    },
                  ],
                }}
              >
                {cities.map((items, index) => (
                  <Placemark
                    key={items.id}
                    geometry={[items.latitude, items.longitude]}
                    modules={[
                      'geoObject.addon.balloon',
                      'geoObject.addon.hint',
                    ]}
                    properties={getPointData(index)}
                    options={getPointOptions(index)}
                  />
                ))}
              </Clusterer>
            </Map>
          </YMaps>
        </>
      ) : null}
    </div>
  );
};
