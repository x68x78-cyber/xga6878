#!/usr/bin/env node
// Build script: embeds the reference 私域社群运营台.html into a DSH workbench client.
// Reads the HTML source, JSON-escapes it, and writes lib/client.js that mounts it
// as a self-contained iframe (srcDoc) inside a customFrame workbench panel.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = process.env.SRC_HTML || join(ROOT, 'docs', 'src', 'index.html')
const OUT = join(ROOT, 'lib', 'client.js')

const html = readFileSync(SRC, 'utf8')
// JSON.stringify produces a safe double-quoted JS string literal (no backticks, no ${}).
const embedded = JSON.stringify(html)

const client = `/**
 * 私域社群运营台（siyu-private-operation-workbench）—— DSH Desktop 工作台浏览器端。
 *
 * 整页业务工作台（customFrame: true）：把本地参考 HTML 私域社群运营台作为自包含 iframe
 * （srcDoc）挂载，保留其全部功能（概览/资产/成员分层/日历/漏斗/复盘/话术库/引流页，
 * 中英双语，localStorage 持久化）。数据只存在本机浏览器 localStorage。
 *
 * 注册身份：GitHub 仓库 https://github.com/x68x78-cyber/xga6878（owner/repository 解析）。
 */
window.__ModuleLoader__.load({
  id: 'siyu-private-operation-workbench',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const { useEffect } = React

    // 参考 HTML 原文（自包含单文件应用）。
    const APP_HTML = ${embedded}

    // 工作台根容器：填满 customFrame 宿主主内容区。
    const frameStyle = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      border: 'none',
      background: '#f4f6f8',
      display: 'block'
    }

    function PrivateOpsPanel() {
      // 每次挂载时若引用 HTML 内部抛错，不阻断宿主；错误留在 iframe 内自包含环境。
      return h('iframe', {
        srcDoc: APP_HTML,
        style: frameStyle,
        title: '私域社群运营台',
        sandbox: 'allow-scripts allow-same-origin allow-forms allow-modals allow-downloads'
      })
    }

    function apply(ctx) {
      ctx.effect(() => ctx.desktopWorkbenches.register({
        title: '私域社群运营台',
        description: '私域社群运营一体化工作台：私域概览、社群资产、成员分层、运营日历、转化漏斗、运营复盘与群话术库。',
        category: '社群运营',
        panelTitle: '私域社群运营台',
        icon: '📊',
        audience: '个人 / 小团队',
        customFrame: true,
        repository: 'https://github.com/x68x78-cyber/xga6878'
      }, PrivateOpsPanel))
    }

    return { apply, inject: ['desktopWorkbenches'] }
  }
})
`

writeFileSync(OUT, client, 'utf8')
console.log('Wrote', OUT, client.length, 'bytes, html', html.length, 'chars')