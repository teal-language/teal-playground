<template>
  <div id="playground">
    <Toolbar @snippetSelected="snippet => (input = snippet.code)" />
    <div class="editors">
      <MonacoEditor
        class="editor-left"
        v-model="input"
        theme="hc-black"
        :options="editorOptions"
        language="lua"
        @editorDidMount="editorDidMount" />
      <MonacoEditor
        class="editor-right"
        v-model="output"
        theme="hc-black"
        :options="editorOptionsOutput"
        language="lua"
        @editorDidMount="editorDidMount" />
      <transition name="fade">
        <div v-if="syntaxErrors || loadError" class="error">
          {{loadError || syntaxErrors}}
        </div>
      </transition>
      <transition name="fade">
        <div v-if="typeErrors" class="type-error">
          {{typeErrors}}
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import MonacoEditor from 'vue-monaco'
import { editor } from 'monaco-editor'
import * as fengari from 'fengari-web'
import basic from '@/snippets/basic'
import Toolbar from '@/components/Toolbar.vue'

const tl = `
package.path = "https://raw.githubusercontent.com/teal-language/tl/master/?.lua"
os = { getenv = function (str) return '' end }
local tl = require('tl')

function error_string(category, errors)
   local result = ''
   if not errors then
      return result
   end
   if #errors > 0 then
      local n = #errors
      result = result .. n .. " " .. category .. (n ~= 1 and "s" or "")
      for _, err in ipairs(errors) do
         result = result .. err.y .. ":" .. err.x .. ": " .. (err.msg or "")
      end
      return result
   end

   return result
end

local output, result = tl.gen([[%input%]])
local syntax_error = error_string('syntax', result.syntax_errors)
local type_error = error_string('type', result.type_errors)

return { output, syntax_error, type_error }
`

export default Vue.extend({
  name: 'Playground',
  components: { MonacoEditor, Toolbar },
  data () {
    return {
      input: `${basic.code}`,
      output: '',
      syntaxErrors: null,
      typeErrors: null,
      loadError: null,
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
          const out = fengari.load(tl.replace('%input%', newValue))()
          this.loadError = null
          this.output = out.get(1) || this.output
          this.syntaxErrors = out.get(2) || null
          this.typeErrors = out.get(3) || null
        } catch (err) {
          this.loadError = err
          console.log(err)
        }
      }
    }
  },

  methods: {
    editorDidMount (editor: editor.IStandaloneCodeEditor): void {
      const isInput = parseInt(editor.getId().split(':')[1]) % 2 === 0

      if (isInput) {
        this.editorInput = editor
      } else {
        this.editorOutput = editor
      }
    }
  },

  mounted (): void {
    window.onresize = () => {
      if (this.editorInput && this.editorOutput && window) {
        this.editorInput.layout({ width: window.innerWidth / 2, height: window.innerHeight })
        this.editorOutput.layout({ width: window.innerWidth / 2, height: window.innerHeight })
      }
    }
  }
})
</script>

<style>
#playground {
  display: flex;
  flex: 1;
  font-size: 20px;
}

.editors {
  margin-top: calc(40px + 1rem);
  display: flex;
  flex: 1;
}

.editor-left, .editor-right {
  flex: 1 1 30%;
  width: 50%;
}

.error {
  background-color: #f47171;
  font-family: monospace;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  padding: 1rem 2rem 1rem;
}
.type-error {
  background-color: #0089eb;
  display: flex;
  align-items: center;
  padding: 1rem 2rem 1rem;
  font-family: monospace;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
