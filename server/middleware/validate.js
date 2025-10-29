export const validate = (schema, prop='body') => (req,res,next)=>{
  const { error, value } = schema.validate(req[prop]);
  if (error) return res.status(400).json({ error: error.details[0].message });
  req[prop] = value; next();
};
