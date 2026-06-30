export const ok      = (res, data, status = 200)    => res.status(status).json({ success: true,  data })
export const created = (res, data)                   => res.status(201).json({ success: true,  data })
export const noContent = (res)                       => res.status(204).send()
export const fail    = (res, message, status = 400)  => res.status(status).json({ success: false, message })
