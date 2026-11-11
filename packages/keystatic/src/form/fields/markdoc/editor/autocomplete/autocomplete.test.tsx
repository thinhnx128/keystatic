import { describe, expect, test, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const usePreventScrollMock = vi.fn();

vi.mock('react-aria/usePreventScroll', () => ({
  usePreventScroll: (options?: { isDisabled?: boolean }) =>
    usePreventScrollMock(options),
}));

vi.mock('../editor-view', () => ({
  useEditorViewRef: () => ({ current: null }),
}));

vi.mock('../keydown', () => ({
  useEditorKeydownListener: () => {},
}));

let mockReferenceElement: Element | null = null;
vi.mock('../popovers/reference', () => ({
  useEditorReferenceElement: () => mockReferenceElement,
}));

vi.mock('./EditorListbox', () => ({
  useEditorListbox: (props: { UNSAFE_style?: React.CSSProperties }) => ({
    keydownListener: () => {},
    listbox: <div data-overscroll={props.UNSAFE_style?.overscrollBehavior} />,
  }),
}));

vi.mock('@keystar/ui/editor', () => ({
  EditorPopover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { EditorAutocomplete } from './autocomplete';

describe('EditorAutocomplete scroll lock (#1634)', () => {
  test('enables usePreventScroll and overscroll containment when reference element is present', () => {
    usePreventScrollMock.mockClear();
    mockReferenceElement = {} as Element;

    const html = renderToStaticMarkup(
      <EditorAutocomplete aria-label="Insert" from={0} to={1} items={[]}>
        {() => null as any}
      </EditorAutocomplete>
    );

    expect(usePreventScrollMock).toHaveBeenCalledWith({ isDisabled: false });
    expect(html).toContain('data-overscroll="contain"');
  });

  test('disables usePreventScroll when reference element is absent', () => {
    usePreventScrollMock.mockClear();
    mockReferenceElement = null;

    renderToStaticMarkup(
      <EditorAutocomplete aria-label="Insert" from={0} to={1} items={[]}>
        {() => null as any}
      </EditorAutocomplete>
    );

    expect(usePreventScrollMock).toHaveBeenCalledWith({ isDisabled: true });
  });
});
