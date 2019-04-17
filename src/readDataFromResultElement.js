export default async elt => {
  const name = await elt.$eval(
    'span.name.actor-name',
    b => b && b.innerText.toLowerCase().trim()
  ).catch(() => '');
  const firstName = name && name.split(/\s/)[0];
  const lastName = name
    .split(/\s/)
    .slice(1)
    .join(' ');
  return {
    name,
    firstName,
    lastName,
  };
};
