import { createElement } from 'react';

export default function DynamicComponent({ is, ...rest }: any) {
  return createElement(require(`./${is}.tsx`).default, {
    ...rest,
  });
}
