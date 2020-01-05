import React from 'react';
import cn from 'classnames';

const Button = (props) => {
  const {
    className,
    tag:Component = 'button',
    ...restProps
  } = props;

  return (
    <Component
      className={cn('button', className)}
      {...restProps}
    />
  );
};

export default Button;
