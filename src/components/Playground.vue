<template>
  <div class="bg-black flex flex-1">
    <Toolbar @snippetSelected="snippet => (input = snippet.code)" />
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
import * as fengari from 'fengari-web'
import SplitPane from 'vue-resize-split-pane'

import Toolbar from '@/components/Toolbar.vue'

// Register a new language
languages.register({ id: 'teal' })

// Register a tokens provider for the language
languages.setMonarchTokensProvider('teal', tealMonacoLanguage)
languages.setLanguageConfiguration('teal', tealMonacoLanguageConfiguration)

const tl = `
package.path = "${process.env.VUE_APP_TL_PACKAGE_PATH_URL}"
os = { getenv = function (str) return '' end }
local tl = require('tl')

local env = tl.init_env(false, false, true)
local output, result = tl.gen(%input%, env)

return { output, result.syntax_errors, result.type_errors }
`

type LuaTableJs = {
  get: (index: number) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  has: (index: number) => boolean;
}

export default Vue.extend({
  name: 'Playground',
  components: { MonacoEditor, Toolbar, SplitPane },
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
      loadError: null,
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
        try {
          if (newValue === '') {
            this.output = ''
            return
          }
          this.$emit('input', newValue)
          const out: LuaTableJs = fengari.load(tl.replace('%input%', JSON.stringify(newValue)))()
          this.loadError = null
          this.output = out.get(1) || this.output
          const syntaxErrors = out.get(2) || null
          const typeErrors = out.get(3) || null

          if (!this.editorInput) {
            return
          }

          const model = this.editorInput.getModel()
          if (!model) {
            return
          }

          const markers = this.getMarkers(model, syntaxErrors, typeErrors)
          editor.setModelMarkers(model, 'owner', markers)
        } catch (err) {
          this.loadError = err
          console.error(err)
        }
      }
    }
  },

  methods: {
    editorDidMount (editor: editor.IStandaloneCodeEditor): void {
      const isInput = parseInt(editor.getId().split(':')[1]) % 2 === 1

      if (isInput) {
        this.editorInput = editor
      } else {
        this.editorOutput = editor
      }
    },

    buildErrorMarkers (model: editor.ITextModel, errors: LuaTableJs) {
      const markers: editor.IMarkerData[] = []

      let i = 1
      while (errors.has(i)) {
        const err = errors.get(i)
        const y = err.get('y')
        const x = err.get('x')
        const message = err.get('msg')
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
        i++
      }

      return markers
    },

    getMarkers (
      model: editor.ITextModel,
      syntaxErrors: LuaTableJs,
      typeErrors: LuaTableJs
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
    }
  },

  mounted (): void {
    this.resizeAll()
    window.onresize = () => {
      this.resizeAll()
    }
  }
})
</script>
