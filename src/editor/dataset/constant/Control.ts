import { IControlOption } from '../../interface/Control'

export const defaultControlOption: Readonly<Required<IControlOption>> = {
  placeholderColor: '#9c9b9b',
  bracketColor: '#000',
  prefix: '{',
  postfix: '}',
  backgroundColor: 'aliceblue',
  hoverHighlightColor: 'lightblue',
  requireBracketColor: 'red',
  requireBackgroundColor: '#fff2f2',
}
