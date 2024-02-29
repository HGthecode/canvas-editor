<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      title="插入字符"
      destroyOnClose
      @cancel="onModalCancel"
      :footer="false"
    >
      <a-tabs>
        <a-tab-pane v-for="(group, index) in symbolData" :key="index" :tab="group.title">
          <div class="symbol-wraper">
            <div class="symbol-list">
              <span
                v-for="(item, cindex) in group.children"
                :key="cindex"
                class="symbol-item"
                @click="onClick(item)"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,onMounted } from 'vue'
  import { ElementType } from '../../index'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import {ConfigProvider,Modal,Tabs,TabPane} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal
  const ATabs = Tabs
  const ATabPane = TabPane
  const props = defineProps({
    command:{
      type:Object,
      default:()=>{}
    }
  })

  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
  }>({
    visible: false,
  })

  function onClick(item:string) {
    props.command.insertElementList([
      {
        type: ElementType.TEXT,
        value: item,
      },
    ])
    onModalCancel()
  }
  function onModalCancel() {
    state.visible = false
  }

  const symbolData = [
    {
      title: '特殊字符',
      children: [
        '、',
        '。',
        '·',
        'ˉ',
        'ˇ',
        '¨',
        '〃',
        '々',
        '—',
        '～',
        '‖',
        '…',
        '‘',
        '’',
        '“',
        '”',
        '〔',
        '〕',
        '〈',
        '〉',
        '《',
        '》',
        '「',
        '」',
        '『',
        '』',
        '〖',
        '〗',
        '【',
        '】',
        '±',
        '×',
        '÷',
        '∶',
        '∧',
        '∨',
        '∑',
        '∏',
        '∪',
        '∩',
        '∈',
        '∷',
        '√',
        '⊥',
        '∥',
        '∠',
        '⌒',
        '⊙',
        '∫',
        '∮',
        '≡',
        '≌',
        '≈',
        '∽',
        '∝',
        '≠',
        '≮',
        '≯',
        '≤',
        '≥',
        '∞',
        '∵',
        '∴',
        '♂',
        '♀',
        '°',
        '′',
        '″',
        '℃',
        '＄',
        '¤',
        '￠',
        '￡',
        '‰',
        '§',
        '№',
        '☆',
        '★',
        '○',
        '●',
        '◎',
        '◇',
        '◆',
        '□',
        '■',
        '△',
        '▲',
        '※',
        '→',
        '←',
        '↑',
        '↓',
        '〓',
        '〡',
        '〢',
        '〣',
        '〤',
        '〥',
        '〦',
        '〧',
        '〨',
        '〩',
        '㊣',
        '㎎',
        '㎏',
        '㎜',
        '㎝',
        '㎞',
        '㎡',
        '㏄',
        '㏎',
        '㏑',
        '㏒',
        '㏕',
        '︰',
      ],
    },
    {
      title: '罗马字符',
      children: [
        'ⅰ',
        'ⅱ',
        'ⅲ',
        'ⅳ',
        'ⅴ',
        'ⅵ',
        'ⅶ',
        'ⅷ',
        'ⅸ',
        'ⅹ',
        'Ⅰ',
        'Ⅱ',
        'Ⅲ',
        'Ⅳ',
        'Ⅴ',
        'Ⅵ',
        'Ⅶ',
        'Ⅷ',
        'Ⅸ',
        'Ⅹ',
        'Ⅺ',
        'Ⅻ',
      ],
    },
    {
      title: '数学字符',
      children: [
        '⒈',
        '⒉',
        '⒊',
        '⒋',
        '⒌',
        '⒍',
        '⒎',
        '⒏',
        '⒐',
        '⒑',
        '⒒',
        '⒓',
        '⒔',
        '⒕',
        '⒖',
        '⒗',
        '⒘',
        '⒙',
        '⒚',
        '⒛',
        '⑴',
        '⑵',
        '⑶',
        '⑷',
        '⑸',
        '⑹',
        '⑺',
        '⑻',
        '⑼',
        '⑽',
        '⑾',
        '⑿',
        '⒀',
        '⒁',
        '⒂',
        '⒃',
        '⒄',
        '⒅',
        '⒆',
        '⒇',
        '①',
        '②',
        '③',
        '④',
        '⑤',
        '⑥',
        '⑦',
        '⑧',
        '⑨',
        '⑩',
        '㈠',
        '㈡',
        '㈢',
        '㈣',
        '㈤',
        '㈥',
        '㈦',
        '㈧',
        '㈨',
        '㈩',
      ],
    },
    {
      title: '医学字符',
      children: [
        'RP',
        'P.O',
        'INJ.',
        'MIXT.',
        'TAD.',
        'SOL.',
        'CO.',
        'PR.',
        'I.D',
        'I.V',
        'I.V.GTT.',
        'IH',
        'IM',
        'O.M',
        'O.N',
        'HS.',
        'AM.',
        'PM.',
        'A.C.',
        'P.C.',
        'SOS.',
        'ST.',
        'QD',
        'BID',
        'TID',
        'QOD',
        'QH',
        'Q2H',
        'Q3H',
        'MCG',
        'MG',
        'G',
        'ML',
        'sig',
        'qd',
        'bid',
        'tid',
        'qid',
        'qh',
        'q2h',
        'q4h',
        'q6h',
        'qn',
        'qod',
        'biw',
        'hs',
        'am',
        'pm',
        'St',
        'DC',
        'prn',
        'sos',
        'ac',
        'pc',
        '12n',
        '12mn',
        'gtt',
        'ID',
        'IH',
        'IM',
        'IV',
        'aa',
        'et',
        'Rp.',
        'sig./S.',
        'St./Stat.',
        'Cit.',
        's.o.s.',
        'p.r.n',
        'a.c.',
        'p.c.',
        'a.m.',
        'p.m.',
        'q.n.',
        'h.s.',
        'q.h.',
        'q.d.',
        'B.i.d.',
        'T.i.d.',
        'Q.i.d.',
        'q.4h.',
        'p.o.',
        'ad \nus.int.',
        'ad \nus.ext.',
        'H.',
        'im./M.',
        'iv./V.',
        'iv \ngtt.',
        'Inhal.',
        'O.D.',
        'O.L.',
        'O.S.',
        'O.U.',
        'No./N.',
        's.s',
        'ug.',
        'mg.',
        'g.',
        'kg.',
        'ml.',
        'L.',
        'q.s',
        'Ad.',
        'Aq.',
        'Aq.dest.',
        'Ft.',
        'Dil',
        'M.D.S.',
        'Co./Comp.',
        'Mist',
        'Pulv.',
        'Amp.',
        'Emul.',
        'Syr.',
        'Tr.',
        'Neb.',
        'Garg.',
        'rtt./gutt.',
        'collyr.',
        'Ocul.',
        'Liq.',
        'Sol.',
        'Lot.',
        'Linim.',
        'Crem.',
        'Ung.',
        'Past.',
        'Ol.',
        'Enem.',
        'Supp.',
        'Tab.',
        'Pil.',
        'Caps.',
        'Inj.',
        'po',
        'im',
        'iv',
        'ivgtt',
        'qd',
        'bid',
        'tid',
        'qid',
        'q8h',
        'qn',
        'Rp',
        'sig',
        'prn',
      ],
    },
  ]
</script>

<style lang="css" scoped>
  .symbol-wraper {
    height: 400px;
    overflow-y: auto;
  }
  .symbol-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: auto;
  }
  .symbol-list span {
    margin: 5px 3px;
    text-align: center;
    border-radius: 3px;
    height: 45px;
    line-height: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .symbol-list span:hover {
    background: #ddd;
  }
</style>
