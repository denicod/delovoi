import React, { useContext } from 'react';
import { Formik } from 'formik';
import { Input } from '../../../../UI/Input';
import styles from './styles.module.scss';
import { Checkbox } from '../../../../UI/Checkbox';
import { Select } from '../../../../UI/Select';
import { Button } from '../../../../UI/Button';
import { LogoIcon } from '../../../../assets/icons';
import { useSignupMutation } from '../../api/useSignupMutation';
import { useNavigate } from 'react-router-dom';
import { useGetConfirmationCode } from '../../api/useGetConfirmationCode';
import { ConfirmPhoneSection } from '../ConfirmPhoneSection';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { AuthContext } from '../../context/AuthContext';
import { useGetRegionsQuery } from '../../api/useGetRegionsQuery';

interface FormState {
  lastname: string;
  firstname: string;
  middlename: string;
  hasntMiddlename: boolean;
  city: { key: string; value: string } | null;
  phone: string;
  personalDataProcessing: boolean;
  isConfirmationStarted: boolean;
  confirmationCode: string | null;
  isPhoneConfirmed: boolean;
}

const initialState: FormState = {
  lastname: '',
  firstname: '',
  middlename: '',
  hasntMiddlename: false,
  city: null as { key: string; value: string } | null,
  phone: '',
  personalDataProcessing: false,
  isConfirmationStarted: false,
  confirmationCode: null,
  isPhoneConfirmed: false,
};

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const localStorage = useLocalStorage();
  const authContext = useContext(AuthContext);
  const { mutateAsync: signup } = useSignupMutation();
  const { mutate: getConfirmationCode, data: codeData } =
    useGetConfirmationCode();
  const onSubmitHandle = async (values: FormState) => {
    if (!values.city?.value) {
      return;
    }
    signup({
      phone: values.phone,
      city: values.city?.key,
      middlename: values.middlename,
      firstname: values.firstname,
      lastname: values.lastname,
    }).then((data) => {
      localStorage.setAuthToken(data.data.token);
      navigate('/');
      authContext.setToken(data.data.token);
      authContext.setAuth(true);
    });
  };

  const onGetConfirmationCodeHandler = React.useCallback(
    async (phone: string) => {
      getConfirmationCode({ phone });
    },
    []
  );

  const { data: regions } = useGetRegionsQuery();

  return (
    <div>
      <Formik initialValues={initialState} onSubmit={onSubmitHandle}>
        {({ values, handleChange, setValues, handleReset, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className={styles.top__wrapper}>
              <Input
                name="lastname"
                placeholder="Фамилия"
                onChange={handleChange}
                value={values.lastname}
                onClear={() => {
                  setValues({ ...values, lastname: '' });
                }}
              />
              <Input
                name="firstname"
                placeholder="Имя"
                onChange={handleChange}
                value={values.firstname}
                onClear={() => {
                  setValues({ ...values, firstname: '' });
                }}
              />
              <Input
                name="middlename"
                placeholder="Отчество"
                onChange={handleChange}
                value={values.middlename}
                onClear={() => {
                  setValues({ ...values, middlename: '' });
                }}
              />
              <label
                className={styles.middlename__wrapper}
                onClick={() => {
                  setValues({
                    ...values,
                    hasntMiddlename: !values.hasntMiddlename,
                  });
                }}
              >
                <div className={styles.middlename__checkbox}>
                  <Checkbox
                    isActive={values.hasntMiddlename}
                    onChange={() => {}}
                  />
                </div>
                <div className={styles.middlename}>Нет отчества</div>
              </label>
            </div>
            <div className={styles.bottom__wrapper}>
              <div className={styles.bottom__city}>
                <Select
                  active={values.city ?? undefined}
                  values={
                    regions?.data.map((region) => ({
                      key: region.code.toString(),
                      value: region.name,
                    })) ?? []
                  }
                  onSelect={(pair) => {
                    setValues({ ...values, city: pair });
                  }}
                />
              </div>
              <div className={styles.phone__wrapper}>
                <div className={styles.phone__input}>
                  <Input
                    placeholder="+79997776655"
                    name="phone"
                    onChange={handleChange}
                    value={values.phone}
                    onClear={() => {
                      setValues({ ...values, phone: '' });
                    }}
                  />
                </div>
                {!values.isConfirmationStarted ? (
                  <div className={styles.phone__button}>
                    <Button
                      onClick={() => {
                        onGetConfirmationCodeHandler(values.phone);
                        setValues({ ...values, isConfirmationStarted: true });
                      }}
                      variant="outlined"
                      type="button"
                      disabled={
                        !values.phone ||
                        (Boolean(values.phone) && values.isConfirmationStarted)
                      }
                    >
                      Подтвердить
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
            {values.isConfirmationStarted ? (
              <ConfirmPhoneSection
                isPhoneConfirmed={values.isPhoneConfirmed}
                hasError={
                  values.confirmationCode !== null &&
                  values.confirmationCode !== codeData?.result.code
                }
                onInputFilled={(code) => {
                  setValues({
                    ...values,
                    confirmationCode: code || null,
                    isPhoneConfirmed: code === codeData?.result.code,
                  });
                }}
                onRefreshCode={async () =>
                  await onGetConfirmationCodeHandler(values.phone)
                }
              />
            ) : null}
            <label
              className={styles.conditions__wrapper}
              onClick={() => {
                setValues({
                  ...values,
                  personalDataProcessing: !values.personalDataProcessing,
                });
              }}
            >
              <div className={styles.conditions__checkbox}>
                <Checkbox
                  isActive={values.personalDataProcessing}
                  onChange={() => {}}
                />
              </div>
              <div>
                Нажимая на кнопку я даю свое согласие на обработку персональных
                данных и соглашаюсь с условиями&nbsp;
                <a href="https://delovoi.me/legal/privacy_policy.pdf">
                  Политики конфиденциальности
                </a>
              </div>
            </label>
            <div className={styles.controlls__wrapper}>
              <div className={styles.controlls__left}>
                <Button onClick={handleReset} variant="outlined" type="reset">
                  Отмена
                </Button>
              </div>
              <div>
                <Button
                  icon={LogoIcon}
                  type="submit"
                  disabled={
                    !values.isPhoneConfirmed || !values.personalDataProcessing
                  }
                >
                  Зарегистрироваться
                </Button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};
