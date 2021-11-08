import { classNames } from '../../helpers/classnames';

export const SettingContainer = ({ className, children }) => {
    return <div className={classNames('setting', className)}>{children}</div>;
};
