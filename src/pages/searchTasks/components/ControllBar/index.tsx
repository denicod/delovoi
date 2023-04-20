import React, { useContext } from 'react';
import { CloseIcon, GeoIcon, ListIcon } from '../../../../assets/icons';
import { type Pair, Select } from '../../../../UI/Select';
import { Formik } from 'formik';
import styles from './styles.module.scss';
import { useTabs } from '../../../../hooks/useTabs';
import classNames from 'classnames';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { useGetVacanciesQuery } from '../../../../modules/tasks';
import { AuthContext } from '../../../../modules/auth';

interface FormState {
  date: string;
  vacancy: Pair;
}

const selectValues: Pair[] = [
  { key: 'all', value: 'Все вакансии' },
  { key: 'seller', value: 'Продавец' },
  { key: 'sorter', value: 'Сортировщик' },
];

const initialValues: FormState = {
  date: '30.03.2023',
  vacancy: selectValues[0],
};

const getNextDate = () => {
  const currentDayInMilli = new Date().getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const nextDayInMilli = currentDayInMilli + oneDay;
  return new Date(nextDayInMilli);
};

interface ControllBarProps {
  activeSelect: Pair;
  onSelect: (pair: Pair) => void;
  onChangeViewClick: (view: 'items' | 'maps') => void;
  onDateChange: (newDateRange: [tomorrow: Date, tomorrow: Date] | null) => void;
  onReset: () => void;
  value: [Date, Date] | null;
}

export const ControllBar: React.FC<ControllBarProps> = ({
  activeSelect,
  onSelect,
  onChangeViewClick,
  onDateChange,
  onReset,
  value,
}) => {
  const { activeTab, onTabChange } = useTabs(0);
  const authContext = useContext(AuthContext);
  const { data } = useGetVacanciesQuery(authContext.token ?? '');

  return (
    <div className={styles.wrapper}>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {({ values, setValues, handleReset }) => (
          <div className={styles.filters}>
            <div>
              <DateRangePicker
                onChange={(dataRange) => {
                  if (dataRange) {
                    onDateChange(dataRange);
                  }
                }}
                ranges={[]}
                value={value ?? [getNextDate(), getNextDate()]}
                isoWeek
                locale={{
                  sunday: 'Вс',
                  monday: 'Пн',
                  tuesday: 'Вт',
                  wednesday: 'Ср',
                  thursday: 'Чт',
                  friday: 'Пт',
                  saturday: 'Сб',
                  ok: 'Ок',
                  today: 'Сегодня',
                  yesterday: 'Вчера',
                  hours: 'Часы',
                  minutes: 'Минуты',
                  seconds: 'Секунды',
                }}
                size="lg"
                onClean={() => onDateChange(null)}
                placeholder="Выберите дату"
                showOneCalendar
                className={styles.calendar}
                menuStyle={{ zIndex: 2000 }}
              />
            </div>
            <div>
              <Select
                values={[
                  { key: 'all', value: 'Все вакансии' },
                  ...(data?.data.vacancy.map(
                    (el) => ({ key: el, value: el } satisfies Pair)
                  ) ?? []),
                ]}
                onSelect={onSelect}
                active={activeSelect}
              />
            </div>
            <button
              className={styles.filters__reset}
              onClick={() => onReset()}
              type="reset"
            >
              <CloseIcon width={20} height={20} fill="#6357AB" />
              Сбросить
            </button>
          </div>
        )}
      </Formik>
      <div className={styles.controlls}>
        <div className={styles.tabs}>
          <button
            className={classNames(
              { [styles['tab--active']]: activeTab === 0 },
              styles.tab
            )}
            onClick={() => {
              onTabChange(0);
              onChangeViewClick('items');
            }}
          >
            <ListIcon
              width={20}
              height={20}
              stroke={activeTab === 0 ? '#3BF1E2' : '#3C2D96'}
            />
          </button>
          <button
            className={classNames(
              { [styles['tab--active']]: activeTab === 1 },
              styles.tab
            )}
            onClick={() => {
              onTabChange(1);
              onChangeViewClick('maps');
            }}
          >
            <GeoIcon
              width={20}
              height={20}
              fill={activeTab === 1 ? '#3BF1E2' : '#3C2D96'}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
