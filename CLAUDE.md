# �ǣ�_�9�\m��

## 2024-03-22: ������_�n9�

### �zW_OL�
1. ���������h���ƭ����ɓn��HBk�����LU�jDOL
2. ������UI��ת���h����	nh:6�nOL
3. �����\L/n���Jd	L�\WjDOL
4. �����nOLk��UIn��'

### ��W_9�

#### 1. ����BnOL�c

����HBn������9�:

```tsx
// ����HBn�
useEffect(() => {
  // ��L	�c_4n�
  if (previousTab !== activeTab) {
    
    // ���ƭ�����K�n��HB
    if (previousTab === "richtext" && contentEditableRef.current) {
      // ���ƭ��n����X
      const currentHTML = contentEditableRef.current.innerHTML;
      if (currentHTML !== htmlContent) {
        setHtmlContent(currentHTML);
        // ������Wf��
        const markdown = convertHtmlToMarkdown(currentHTML);
        setContent(markdown);
      }
    }
    
    // ���������K�n��HB
    if (previousTab === "write") {
      // HTML���
      const html = convertMarkdownToHtml(content);
      if (html !== htmlContent) {
        setHtmlContent(html);
      }
    }
    
    // HTML������K�n��HB
    if (previousTab === "html") {
      // ��������
      const markdown = convertHtmlToMarkdown(htmlContent);
      setContent(markdown);
    }
    
    // M�n�֒��
    setPreviousTab(activeTab);
  }
}, [activeTab, htmlContent, content, setHtmlContent, setContent, previousTab]);
```

#### 2. ������UI�K�n9�

�K	pn�k���:

```tsx
// ���ƭ�Ȩǣ��K
const [tableSelection, setTableSelection] = useState<TableSelectionState | null>(null);
const [showTableModal, setShowTableModal] = useState(false); // ����h:(
const [showTablePopover, setShowTablePopover] = useState(false); // ��ת���h:(
```

��ת���h����nh:6���:

```tsx
// ��ת���nh:6�
<Popover open={showTablePopover} onOpenChange={setShowTablePopover}>
  <PopoverTrigger asChild>
    <Button>...</Button>
  </PopoverTrigger>
  <PopoverContent>
    ...
    <Button onClick={() => setShowTableModal(true)}>
      s0jh�ƒ�O
    </Button>
    ...
  </PopoverContent>
</Popover>

// ���������nh:6�
{tableSelection && showTableModal && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    onClick={() => setShowTableModal(false)}
  >
    ...
  </div>
)}
```

#### 3. ������_�n�c

L��\�pn9�:

```tsx
// hnL�Jd
const deleteTableRow = () => {
  if (!tableSelection) return;
  
  try {
    const { table, row } = tableSelection;
    
    // ����LoJdgMjD
    if (row === 0) return;
    
    // hk N2LoŁ����+���L	
    if (table.rows.length <= 2) return;
    
    // L�Jd
    table.deleteRow(row);
    
    // ��L	�U�_ng����
    updateRichTextContent();
    
    // x��K����
    setTableSelection(null);
    setShowTableModal(false);
    setShowTablePopover(false);
  } catch (error) {
    console.error('LnJdk1WW~W_:', error);
  }
};
```

#### 4. �����n9,�9�

�����6�h������n9�:

```tsx
// ����#n��ï��Y������
const handleTableClick = (e: MouseEvent) => {
  // h�����n��ïo�k�n4@g�U��ngSSgo!�
  if ((e.target as HTMLElement).closest('.table-toolbar')) {
    return;
  }
  
  // ��ïMnn� �֗
  let target = e.target as HTMLElement;
  
  // ��ïW_� Lhn�j�����x����
  const isOutsideTable = !target.closest('table');
  if (isOutsideTable) {
    setTableSelection(null);
    setShowTablePopover(false);
    return;
  }
  
  // ������b�� (����n��ïn4)
  e.stopPropagation();
  
  // ��ïW_� ~_o]n�L��(td/th)K�$�
  let cell: HTMLTableCellElement | null = null;
  if (target.tagName === 'TD' || target.tagName === 'TH') {
    cell = target as HTMLTableCellElement;
  } else {
    cell = target.closest('td, th') as HTMLTableCellElement;
  }
  
  // ��L�dK�jD4oU�WjD
  if (!cell) return;
  
  // ��L�dKc_4��n�����֗
  const tableElement = cell.closest('table') as HTMLTableElement;
  if (!tableElement) return;
  
  // Lhn���ï��֗
  const rowElement = cell.parentElement as HTMLTableRowElement;
  if (!rowElement) return;
  
  const row = rowElement.rowIndex;
  const col = cell.cellIndex;
  
  console.log('�����Lx�U�~W_:', { row, col });
  
  // hnx��K���
  setTableSelection({ table: tableElement, row, col });
  
  // ��ת����h:�kh:U�fD�4o�K��	
  if (!showTablePopover) {
    setShowTablePopover(true);
  }
};
```

��������n{2�9�:

```tsx
// click���Ȓ( (ަ�ܿ�L�U�_BkzkY�_�����)
contentEditableRef.current.addEventListener('click', handleTableClick);

// �����է��g���Ȓ���*H�L�D	
document.addEventListener('click', handleDocumentClick, { capture: true });
```

MutationObservern i:

```tsx
const observer = new MutationObserver((mutations) => {
  // pn	�� dn�����������k~h�f�
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  animationFrameId = requestAnimationFrame(() => {
    // DOM	�L����k�#Y�K��
    const tableAffected = mutations.some(mutation => {
      return mutation.target.nodeName === 'TABLE' || 
             mutation.target.closest('table') || 
             Array.from(mutation.addedNodes).some(node => 
               (node as HTMLElement).nodeName === 'TABLE' || 
               (node as HTMLElement).querySelector?.('table')
             );
    });
    
    // ����#n	�LjD4o����
    if (!tableAffected && mutations.length < 5) return;
    
    // hn����h���������-�
    if (contentEditableRef.current) {
      const tables = contentEditableRef.current.querySelectorAll('table');
      if (tables.length > 0) {
        tables.forEach(table => {
          // ���빿��h�빿��n-�...
        });
      }
    }
  });
});
```

### !ޟň�n_�

#### MUST
1. ������BnUndonՒ9����\�kcWOUndogMjD���LB�	
2. ����n��nE�t_����
3. �������\�n�����h:Mnn�t�(nMnL��gjD	

#### NICE-TO-HAVE
1. ������Ӳ�����p��ji	g����듒��Y�_�
2. ����hS�x�Y�ܿ�
3. ���빿��n�������������jWji	
4. �����n�����Mn�׷����H-.�H��H	
5. ����n굤�����n��ަ���ðg���	�	