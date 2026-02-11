const { widget } = figma
const { AutoLayout, Text, Rectangle, Ellipse, Image, Input, useSyncedState, useSyncedMap, usePropertyMenu } = widget

const STATUS_BADGES: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  WIP: { bg: '#F5D000', dot: '#111111', text: '#111111', label: 'WIP' },
  'READY TO VALIDATE': { bg: '#E1BEE7', dot: '#283593', text: '#283593', label: 'READY TO VALIDATE' },
  APPROVED: { bg: '#4CAF50', dot: '#FFFFFF', text: '#FFFFFF', label: 'APPROVED' },
  BLOCKED: { bg: '#E53935', dot: '#FFFFFF', text: '#FFFFFF', label: 'BLOCKED' },
  ARCHIVED: { bg: '#E0E0E0', dot: '#616161', text: '#616161', label: 'ARCHIVED' },
  HANDOFF: { bg: '#B2DFDB', dot: '#00695C', text: '#00695C', label: 'HANDOFF' },
}
const STATUS_KEYS = Object.keys(STATUS_BADGES)

const headerGradient: WidgetJSX.GradientPaint = {
  type: 'gradient-linear',
  gradientHandlePositions: [
    { x: 0, y: 0.5 },
    { x: 1, y: 0.5 },
    { x: 1, y: 0 },
  ],
  gradientStops: [
    { position: 0, color: { r: 0.98, g: 0.94, b: 1, a: 1 } },
    { position: 1, color: { r: 0.9, g: 0.95, b: 1, a: 1 } },
  ],
}

const borderGradient: WidgetJSX.GradientPaint = {
  type: 'gradient-linear',
  gradientHandlePositions: [
    { x: 0, y: 0.5 },
    { x: 1, y: 0.5 },
    { x: 1, y: 0 },
  ],
  gradientStops: [
    { position: 0, color: { r: 0.236, g: 0.53, b: 0.964, a: 1 } },
    { position: 0.5, color: { r: 0.646, g: 0.3, b: 0.97, a: 1 } },
    { position: 1, color: { r: 0.924, g: 0.276, b: 0.535, a: 1 } },
  ],
}

function TaskCardWidget() {
  const [contactsVisible, setContactsVisible] = useSyncedState('contactsVisible', [true])
  const [tasksVisible, setTasksVisible] = useSyncedState('tasksVisible', [true])
  const [taskChecked, setTaskChecked] = useSyncedState('taskChecked', [false])
  const [currentUserPhoto] = useSyncedState('currentUserPhoto', () => figma.currentUser?.photoUrl ?? null)
  const [statusKey, setStatusKey] = useSyncedState('statusBadge', 'WIP')
  const [projectName, setProjectName] = useSyncedState('projectName', '')
  const [dateStart, setDateStart] = useSyncedState('dateStart', '')
  const [dateValidate, setDateValidate] = useSyncedState('dateValidate', '')
  const [dateHandoff, setDateHandoff] = useSyncedState('dateHandoff', '')
  const [dateApproved, setDateApproved] = useSyncedState('dateApproved', '')
  const [lastUpdated, setLastUpdated] = useSyncedState('lastUpdated', () => new Date().toISOString())
  const [taskDescription, setTaskDescription] = useSyncedState('taskDescription', '')
  const [resourcesVisible, setResourcesVisible] = useSyncedState('resourcesVisible', [true])
  const contactFields = useSyncedMap('contactFields')
  const taskFields = useSyncedMap('taskFields')
  const resourceFields = useSyncedMap('resourceFields')

  usePropertyMenu(
    [
      {
        itemType: 'dropdown',
        propertyName: 'status',
        tooltip: 'Estado',
        options: STATUS_KEYS.map(key => ({ label: key, option: key })),
        selectedOption: STATUS_KEYS.includes(statusKey) ? statusKey : 'WIP',
      },
    ],
    (event) => {
      if (event.propertyName === 'status' && event.propertyValue && STATUS_KEYS.includes(event.propertyValue)) {
        setStatusKey(event.propertyValue)
      }
    },
  )

  const refreshLastUpdated = () => setLastUpdated(new Date().toISOString())
  const pad = (n: number) => n < 10 ? '0' + n : String(n)
  const lastUpdateDate = lastUpdated ? new Date(lastUpdated) : new Date()
  const datePart = `${pad(lastUpdateDate.getDate())}/${pad(lastUpdateDate.getMonth() + 1)}/${lastUpdateDate.getFullYear()}`
  const timePart = `${pad(lastUpdateDate.getHours())}:${pad(lastUpdateDate.getMinutes())}h`
  const lastUpdateStr = `${datePart}, ${timePart}`

  const addContact = () => setContactsVisible(prev => [...prev, true])
  const hideContact = (index: number) => setContactsVisible(prev => {
    const next = [...prev]
    next[index] = false
    return next
  })
  const addResource = () => setResourcesVisible(prev => [...prev, true])
  const hideResource = (index: number) => setResourcesVisible(prev => {
    const next = [...prev]
    next[index] = false
    const visibleCount = next.filter(Boolean).length
    if (visibleCount === 0) {
      resourceFields.delete('0_name')
      resourceFields.delete('0_url')
      return [true]
    }
    return next
  })
  const addTask = () => {
    setTasksVisible(prev => [...prev, true])
    setTaskChecked(prev => [...prev, false])
  }
  const toggleTask = (index: number) => {
    setTaskChecked(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
    refreshLastUpdated()
  }

  return (
    <AutoLayout
      name="container"
      direction="vertical"
      width={800}
      padding={0}
      spacing={0}
      fill="#FFFFFF"
      cornerRadius={24}
      stroke={borderGradient}
      strokeWidth={4}
      strokeAlign="outside"
    >
      <AutoLayout
        name="header"
        direction="horizontal"
        width="fill-parent"
        padding={{ top: 48, right: 48, bottom: 24, left: 48 }}
        spacing={20}
        fill={headerGradient}
        verticalAlignItems="center"
      >
        <AutoLayout
          name="intro"
          direction="vertical"
          spacing={8}
          width="fill-parent"
        >
          <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
            <Input
              name="title"
              value={projectName || null}
              onTextEditEnd={(e) => { setProjectName(e.characters); refreshLastUpdated() }}
              placeholder="[Aquí el nombre del proyecto]"
              placeholderProps={{ opacity: 0.7 }}
              width="fill-parent"
              fontSize={24}
              lineHeight={32}
              fontWeight="bold"
              fill="#111111"
            />
          </AutoLayout>
          <AutoLayout
            name="last-update"
            direction="horizontal"
            spacing={4}
            verticalAlignItems="center"
          >
            <Text
              name="text"
              fontSize={16}
              lineHeight={24}
              fill="#555555"
            >
              Última actualización:
            </Text>
            <Text
              name="update-date"
              fontSize={16}
              lineHeight={24}
              fill="#555555"
            >
              {lastUpdateStr}
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      <Rectangle
        name="divider"
        width="fill-parent"
        height={1}
        fill="#D1D1DD"
      />

      <AutoLayout
        name="body"
        direction="vertical"
        width="fill-parent"
        padding={24}
        spacing={12}
      >
        <AutoLayout
          name="description"
          direction="vertical"
          width="fill-parent"
          padding={48}
          spacing={32}
          fill="#FFFFFF"
          cornerRadius={16}
          stroke="#D1D1DD"
        >
          <AutoLayout
            name="intro"
            direction="vertical"
            width="fill-parent"
          >
            <Text
              name="title"
              fontSize={24}
              lineHeight={32}
              fontWeight="bold"
              fill="#111111"
            >
              Descripción de la tarea
            </Text>
          </AutoLayout>
          <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
            <Input
              name="description-text"
              value={taskDescription || null}
              onTextEditEnd={(e) => { setTaskDescription(e.characters); refreshLastUpdated() }}
              placeholder="[Escribe la descripción de la tarea]"
              placeholderProps={{ opacity: 0.7 }}
              width="fill-parent"
              fontSize={20}
              lineHeight={28}
              fill="#555555"
            />
          </AutoLayout>
        </AutoLayout>

        <AutoLayout
          name="dates"
          direction="vertical"
          width="fill-parent"
          padding={48}
          spacing={32}
          fill="#FFFFFF"
          cornerRadius={16}
          stroke="#D1D1DD"
        >
          <AutoLayout
            name="intro"
            direction="vertical"
            width="fill-parent"
          >
            <Text
              name="title"
              fontSize={24}
              lineHeight={32}
              fontWeight="bold"
              fill="#111111"
            >
              Fechas
            </Text>
          </AutoLayout>

          <AutoLayout
            name="list"
            direction="vertical"
            width="fill-parent"
            spacing={32}
          >
            <AutoLayout
              name="start-date"
              direction="horizontal"
              width="fill-parent"
              spacing={8}
              verticalAlignItems="start"
            >
              <Text fontSize={20} lineHeight={28} fill="#111111">📅</Text>
              <Text name="text" width={140} fontSize={20} lineHeight={28} fontWeight="bold" fill="#111111">
                Inicio:
              </Text>
              <AutoLayout name="editable-text" direction="horizontal" width="fill-parent">
                <Input
                  name="date"
                  value={dateStart || null}
                  onTextEditEnd={(e) => { setDateStart(e.characters); refreshLastUpdated() }}
                  placeholder="[añadir la fecha de inicio]"
                  placeholderProps={{ opacity: 0.7 }}
                  width="fill-parent"
                  fontSize={20}
                  lineHeight={28}
                  fill="#555555"
                />
              </AutoLayout>
            </AutoLayout>

            <AutoLayout
              name="to-validate-date"
              direction="horizontal"
              width="fill-parent"
              spacing={8}
              verticalAlignItems="start"
            >
              <Text fontSize={20} lineHeight={28} fill="#111111">✏️</Text>
              <Text name="text" width={140} fontSize={20} lineHeight={28} fontWeight="bold" fill="#111111">
                Para validar:
              </Text>
              <AutoLayout name="editable-text" direction="horizontal" width="fill-parent">
                <Input
                  name="date"
                  value={dateValidate || null}
                  onTextEditEnd={(e) => { setDateValidate(e.characters); refreshLastUpdated() }}
                  placeholder="[añadir la fecha de entrega para validar]"
                  placeholderProps={{ opacity: 0.7 }}
                  width="fill-parent"
                  fontSize={20}
                  lineHeight={28}
                  fill="#555555"
                />
              </AutoLayout>
            </AutoLayout>

            <AutoLayout
              name="approved-date"
              direction="horizontal"
              width="fill-parent"
              spacing={8}
              verticalAlignItems="start"
            >
              <Text fontSize={20} lineHeight={28} fill="#111111">✅</Text>
              <Text name="text" width={140} fontSize={20} lineHeight={28} fontWeight="bold" fill="#111111">
                Aprobado:
              </Text>
              <AutoLayout name="editable-text" direction="horizontal" width="fill-parent">
                <Input
                  name="date"
                  value={dateApproved || null}
                  onTextEditEnd={(e) => { setDateApproved(e.characters); refreshLastUpdated() }}
                  placeholder="[añadir la fecha de aprobación]"
                  placeholderProps={{ opacity: 0.7 }}
                  width="fill-parent"
                  fontSize={20}
                  lineHeight={28}
                  fill="#555555"
                />
              </AutoLayout>
            </AutoLayout>

            <AutoLayout
              name="handoff-date"
              direction="horizontal"
              width="fill-parent"
              spacing={8}
              verticalAlignItems="start"
            >
              <Text fontSize={20} lineHeight={28} fill="#111111">🚀</Text>
              <Text name="text" width={140} fontSize={20} lineHeight={28} fontWeight="bold" fill="#111111">
                Handoff:
              </Text>
              <AutoLayout name="editable-text" direction="horizontal" width="fill-parent">
                <Input
                  name="date"
                  value={dateHandoff || null}
                  onTextEditEnd={(e) => { setDateHandoff(e.characters); refreshLastUpdated() }}
                  placeholder="[añadir la fecha de handoff]"
                  placeholderProps={{ opacity: 0.7 }}
                  width="fill-parent"
                  fontSize={20}
                  lineHeight={28}
                  fill="#555555"
                />
              </AutoLayout>
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>

        <AutoLayout
          name="contacts"
          direction="vertical"
          width="fill-parent"
          padding={48}
          spacing={32}
          fill="#FAFAFF"
          cornerRadius={16}
          stroke="#D1D1DD"
        >
          <AutoLayout
            name="intro"
            direction="horizontal"
            width="fill-parent"
            verticalAlignItems="center"
            spacing={12}
          >
            <Text
              name="title"
              fontSize={24}
              lineHeight={32}
              fontWeight="bold"
              fill="#111111"
              width="fill-parent"
            >
              Contactos
            </Text>
            <Text
              name="add-contact"
              fontSize={16}
              lineHeight={24}
              fontWeight="bold"
              fill="#0A6BFF"
              textDecoration="underline"
              onClick={addContact}
            >
              Añadir contacto
            </Text>
          </AutoLayout>

          <AutoLayout
            name="list"
            direction="vertical"
            width="fill-parent"
            spacing={32}
          >
            {contactsVisible.map((visible, index) => (
              visible && (
                <AutoLayout
                  key={index}
                  name={`contact-${index + 1 < 10 ? '0' : ''}${index + 1}`}
                  direction="horizontal"
                  width="fill-parent"
                  spacing={12}
                  verticalAlignItems="center"
                >
                  <AutoLayout name="info" direction="vertical" width="fill-parent" spacing={8}>
                    <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
                      <Input
                        name="name"
                        value={((contactFields.get(`${index}_name`) as string | undefined) ?? '') || null}
                        onTextEditEnd={(e) => { contactFields.set(`${index}_name`, e.characters); refreshLastUpdated() }}
                        placeholder="[Nombre del/la profesional]"
                        placeholderProps={{ opacity: 0.7 }}
                        width="fill-parent"
                        fontSize={20}
                        lineHeight={28}
                        fontWeight="bold"
                        fill="#111111"
                      />
                    </AutoLayout>
                    <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
                      <Input
                        name="rol"
                        value={((contactFields.get(`${index}_rol`) as string | undefined) ?? '') || null}
                        onTextEditEnd={(e) => { contactFields.set(`${index}_rol`, e.characters); refreshLastUpdated() }}
                        placeholder="[rol del/la profesional]"
                        placeholderProps={{ opacity: 0.7 }}
                        width="fill-parent"
                        fontSize={16}
                        lineHeight={24}
                        fill="#555555"
                      />
                    </AutoLayout>
                    <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
                      <Input
                        name="email"
                        value={((contactFields.get(`${index}_email`) as string | undefined) ?? '') || null}
                        onTextEditEnd={(e) => { contactFields.set(`${index}_email`, e.characters); refreshLastUpdated() }}
                        placeholder="[añadir email de la persona aquí]"
                        placeholderProps={{ opacity: 0.7 }}
                        width="fill-parent"
                        fontSize={20}
                        lineHeight={28}
                        fill="#0A6BFF"
                        textDecoration="underline"
                      />
                    </AutoLayout>
                  </AutoLayout>
                  {index > 0 && (
                    <Text
                      name="remove"
                      fontSize={18}
                      lineHeight={26}
                      fontWeight={800}
                      fill="#666666"
                      onClick={() => hideContact(index)}
                    >
                      ✕
                    </Text>
                  )}
                </AutoLayout>
              )
            ))}
          </AutoLayout>
        </AutoLayout>

        <AutoLayout
          name="resources"
          direction="vertical"
          width="fill-parent"
          padding={48}
          spacing={32}
          fill="#FFFFFF"
          cornerRadius={16}
          stroke="#D1D1DD"
        >
          <AutoLayout
            name="intro"
            direction="horizontal"
            width="fill-parent"
            verticalAlignItems="center"
            spacing={12}
          >
            <Text
              name="title"
              fontSize={24}
              lineHeight={32}
              fontWeight="bold"
              fill="#111111"
              width="fill-parent"
            >
              Recursos
            </Text>
            <Text
              name="link"
              fontSize={16}
              lineHeight={24}
              fontWeight="bold"
              fill="#0A6BFF"
              textDecoration="underline"
              onClick={addResource}
            >
              Añadir recurso
            </Text>
          </AutoLayout>
          <AutoLayout
            name="list"
            direction="vertical"
            width="fill-parent"
            spacing={24}
          >
            {resourcesVisible.map((visible, index) => (
              visible && (
                <AutoLayout
                  key={index}
                  name={`resource-${index + 1 < 10 ? '0' : ''}${index + 1}`}
                  direction="horizontal"
                  width="fill-parent"
                  spacing={12}
                  verticalAlignItems="center"
                >
                  <AutoLayout name="editable-text" direction="vertical" width="fill-parent" spacing={8}>
                    <Input
                      name="resource-name"
                      value={((resourceFields.get(`${index}_name`) as string | undefined) ?? '') || null}
                      onTextEditEnd={(e) => { resourceFields.set(`${index}_name`, e.characters); refreshLastUpdated() }}
                      placeholder="[Nombre del recurso]"
                      placeholderProps={{ opacity: 0.7 }}
                      width="fill-parent"
                      fontSize={20}
                      lineHeight={28}
                      fill="#111111"
                    />
                    <Input
                      name="resource-url"
                      value={((resourceFields.get(`${index}_url`) as string | undefined) ?? '') || null}
                      onTextEditEnd={(e) => { resourceFields.set(`${index}_url`, e.characters); refreshLastUpdated() }}
                      placeholder="[url del recurso]"
                      placeholderProps={{ opacity: 0.7 }}
                      width="fill-parent"
                      fontSize={20}
                      lineHeight={28}
                      fill="#0A6BFF"
                      textDecoration="underline"
                    />
                  </AutoLayout>
                  {(index > 0 ||
                    (index === 0 &&
                      (((resourceFields.get('0_name') as string | undefined) ?? '').trim().length > 0 ||
                        ((resourceFields.get('0_url') as string | undefined) ?? '').trim().length > 0 ||
                        resourcesVisible.filter(Boolean).length > 1))) && (
                    <Text
                      name="remove"
                      fontSize={18}
                      lineHeight={26}
                      fontWeight={800}
                      fill="#666666"
                      onClick={() => hideResource(index)}
                    >
                      ✕
                    </Text>
                  )}
                </AutoLayout>
              )
            ))}
          </AutoLayout>
        </AutoLayout>

        <AutoLayout
          name="checklist"
          direction="vertical"
          width="fill-parent"
          padding={48}
          spacing={32}
          fill="#FFFFFF"
          cornerRadius={16}
          stroke="#9183C9"
          strokeWidth={2}
          strokeDashPattern={[6, 6]}
        >
          <AutoLayout
            name="intro"
            direction="horizontal"
            width="fill-parent"
            verticalAlignItems="center"
            spacing={12}
          >
            <Text
              name="title"
              fontSize={24}
              lineHeight={32}
              fontWeight="bold"
              fill="#111111"
              width="fill-parent"
            >
              Checklist
            </Text>
            <Text
              name="add-task"
              fontSize={16}
              lineHeight={24}
              fontWeight="bold"
              fill="#0A6BFF"
              textDecoration="underline"
              onClick={addTask}
            >
              Añadir tarea
            </Text>
          </AutoLayout>

          <AutoLayout
            name="list"
            direction="vertical"
            width="fill-parent"
            spacing={24}
          >
            {tasksVisible.map((visible, index) => (
              visible && (
                <AutoLayout
                  key={index}
                  name={`item-${index + 1 < 10 ? '0' : ''}${index + 1}`}
                  direction="horizontal"
                  width="fill-parent"
                  spacing={12}
                  verticalAlignItems="start"
                >
                  <AutoLayout
                    name="checkbox"
                    width={24}
                    height={24}
                    cornerRadius={4}
                    fill={taskChecked[index] ? '#9747FF' : '#FFFFFF'}
                    stroke={taskChecked[index] ? '#9747FF' : '#555555'}
                    strokeWidth={2}
                    verticalAlignItems="center"
                    horizontalAlignItems="center"
                    onClick={() => toggleTask(index)}
                  >
                    {taskChecked[index] && (
                      <Text fontSize={14} lineHeight={22} fontWeight="bold" fill="#FFFFFF">
                        ✓
                      </Text>
                    )}
                  </AutoLayout>
                  <AutoLayout
                    name="label + date"
                    direction="vertical"
                    width="fill-parent"
                    spacing={4}
                  >
                    <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
                      <Input
                        name="label"
                        value={((taskFields.get(`${index}_label`) as string | undefined) ?? '') || null}
                        onTextEditEnd={(e) => { taskFields.set(`${index}_label`, e.characters); refreshLastUpdated() }}
                        placeholder="[Tarea]"
                        placeholderProps={{ opacity: 0.7 }}
                        width="fill-parent"
                        fontSize={20}
                        lineHeight={28}
                        fill="#111111"
                      />
                    </AutoLayout>
                    <AutoLayout name="editable-text" direction="vertical" width="fill-parent">
                      <Input
                        name="secondary-text"
                        value={((taskFields.get(`${index}_secondary`) as string | undefined) ?? '') || null}
                        onTextEditEnd={(e) => { taskFields.set(`${index}_secondary`, e.characters); refreshLastUpdated() }}
                        placeholder=""
                        width="fill-parent"
                        fontSize={14}
                        lineHeight={22}
                        fill="#555555"
                      />
                    </AutoLayout>
                  </AutoLayout>
                </AutoLayout>
              )
            ))}
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      <Rectangle
        name="divider"
        width="fill-parent"
        height={1}
        fill="#D1D1DD"
      />

      <AutoLayout
        name="footer"
        direction="horizontal"
        width="fill-parent"
        padding={48}
        verticalAlignItems="center"
        spacing={16}
      >
        <AutoLayout
          name="avatar"
          direction="horizontal"
          width="fill-parent"
          spacing={-8}
          verticalAlignItems="center"
        >
          {currentUserPhoto ? (
            <Image
              name="author01"
              width={40}
              height={40}
              cornerRadius={20}
              src={currentUserPhoto}
            />
          ) : (
            <Ellipse
              name="author01"
              width={40}
              height={40}
              fill="#E8E8E8"
              stroke="#9183C9"
              strokeWidth={2}
              strokeDashPattern={[4, 4]}
            />
          )}
        </AutoLayout>
        <AutoLayout
          name="status-badge"
          direction="horizontal"
          padding={{ vertical: 8, horizontal: 12 }}
          spacing={8}
          cornerRadius={999}
          fill={STATUS_BADGES[statusKey]?.bg ?? STATUS_BADGES.WIP.bg}
          stroke={STATUS_BADGES[statusKey]?.bg === '#FFFFFF' ? '#E0E0E0' : undefined}
          verticalAlignItems="center"
        >
          <Ellipse width={8} height={8} fill={STATUS_BADGES[statusKey]?.dot ?? STATUS_BADGES.WIP.dot} />
          <Text fontSize={12} lineHeight={20} fontWeight="bold" fill={STATUS_BADGES[statusKey]?.text ?? STATUS_BADGES.WIP.text}>
            {STATUS_BADGES[statusKey]?.label ?? 'WIP'}
          </Text>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(TaskCardWidget)
