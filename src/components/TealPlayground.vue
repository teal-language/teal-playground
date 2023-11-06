<template>
  <div class="bg-black flex flex-1">
    <TealToolbar @snippetSelected="snippet => (input = snippet.code)" />
    <div class="flex flex-1 mt-14 bg-black overflow-scroll">
      <split-pane
        @update:size="resizeSplit"
        :allow-resize="true"
        units="pixels"
        :size="initialWidth"
        class="bg-black"
      >
        <template #firstPane>
          <div class="flex flex-1">
            <MonacoEditor
              v-model="input"
              theme="hc-black"
              :options="editorOptions"
              language="teal"
              @editorDidMount="editorDidMount"
            />
          </div>
        </template>
        <template #secondPane>
          <div class="flex flex-1">
            <MonacoEditor
              v-model="output"
              theme="hc-black"
              :options="editorOptionsOutput"
              language="lua"
              @editorDidMount="editorDidMount" />
          </div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import MonacoEditor from 'vue-monaco'
import { languages, editor, MarkerSeverity, Position } from 'monaco-editor'
import {
  tealMonacoLanguage,
  tealMonacoLanguageConfiguration
} from '@/teal-monaco-language'
import SplitPane from 'vue-resize-split-pane'

import TealToolbar from '@/components/TealToolbar.vue'
import TealError from '@/TealError'

import CompilerWorker from '@/CompilerWorker.ts?worker'
const compilerWorker = new CompilerWorker()

// Register a new language
languages.register({ id: 'teal' })

// Register a tokens provider for the language
languages.setMonarchTokensProvider('teal', tealMonacoLanguage)
languages.setLanguageConfiguration('teal', tealMonacoLanguageConfiguration)

const TealPlayground = Vue.extend({
  name: 'TealPlayground',
  components: { MonacoEditor, TealToolbar, SplitPane },
  props: {
    initialData: {
      type: Function,
      required: false,
      default: function () { return '' }
    }
  },
  data () {
    return {
      input: this.initialData(),
      initialWidth: 0,
      output: '',
      syntaxErrors: null,
      typeErrors: null,
      markers: [] as editor.IMarkerData[],
      editorInput: null as editor.IStandaloneCodeEditor | null,
      editorOutput: null as editor.IStandaloneCodeEditor | null,
      editorOptions: {
        fontSize: 20,
        minimap: {
          enabled: false
        },
        renderIndentGuides: false
      } as editor.IEditorOptions
    }
  },
  computed: {
    editorOptionsOutput (): editor.IEditorOptions {
      return {
        ...this.editorOptions,
        readOnly: true
      }
    }
  },
  watch: {
    input: {
      immediate: true,
      deep: true,
      handler (newValue: string): void {
        if (newValue === '') {
          this.output = ''
          return
        }
        this.$emit('input', newValue)
        compilerWorker.postMessage(['compile', newValue])
      }
    }
  },

  methods: {
    editorDidMount (editor: editor.IStandaloneCodeEditor): void {
      const isInput = parseInt(editor.getId().split(':')[1]) % 2 === 1

      if (isInput) {
        this.editorInput = editor
        compilerWorker.postMessage(['compile', this.input])
      } else {
        this.editorOutput = editor
      }

      this.resizeAll()
    },

    buildErrorMarkers (model: editor.ITextModel, errors: [TealError]) {
      const markers: editor.IMarkerData[] = []

      for (const i in errors) {
        const err = errors[i]
        const y = err.y
        const x = err.x
        const message = err.msg
        const word = model.getWordAtPosition(new Position(y, x))

        let startColumn = x
        let endColumn = x

        if (word) {
          startColumn = word.startColumn
          endColumn = word.endColumn
        }

        markers.push({
          message,
          startLineNumber: y,
          startColumn,
          endLineNumber: y,
          endColumn,
          severity: MarkerSeverity.Error
        })
      }

      return markers
    },

    getMarkers (
      model: editor.ITextModel,
      syntaxErrors: [TealError],
      typeErrors:  [TealError]
    ): editor.IMarkerData[] {
      const markers = [
        ...this.buildErrorMarkers(model, syntaxErrors),
        ...this.buildErrorMarkers(model, typeErrors)
      ]

      return markers
    },

    resizeAll () {
      this.initialWidth = window.innerWidth / 2
      this.resizeEditor(this.editorInput, this.initialWidth)
      this.resizeEditor(this.editorOutput, this.initialWidth)
    },

    /**
     * @param{number} width - pixels
     */
    resizeSplit (width: number) {
      this.resizeEditor(this.editorInput, width)
      this.resizeEditor(this.editorOutput, window.innerWidth - width)
    },

    resizeEditor (editor: editor.IStandaloneCodeEditor | null, width: number) {
      if (editor && window) {
        editor.layout({
          width,
          height: window.innerHeight
        })
      }
    },

    onCompiled (
      output: string,
      syntaxErrors: [TealError],
      typeErrors: [TealError]
    ) {
      this.output = output || this.output

      if (!this.editorInput) {
        return
      }

      const model = this.editorInput.getModel()
      if (!model) {
        return
      }

      const markers = this.getMarkers(model, syntaxErrors, typeErrors)
      editor.setModelMarkers(model, 'owner', markers)
    }
  },

  mounted (): void {
    this.resizeAll()
    window.onresize = () => {
      this.resizeAll()
    }

    compilerWorker.onmessage = (msg) => {
      switch (msg.data[0]) {
        case 'compiled':
        {
          const output = msg.data[1]
          const syntaxErrors = msg.data[2]
          const typeErrors = msg.data[3]

          this.onCompiled(output, syntaxErrors, typeErrors)
          break
        }
        case 'error':
        {
          const err = msg.data[1]

          console.error(err)
          break
        }
      }
    }
  }
})

export default TealPlayground
</script>
