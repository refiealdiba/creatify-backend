# temp-users-creatify

## Login

url: localhost:3000/auth/login

## Register

url: localhost:3000/auth/register
NOTE: register butuh input opsi buat role.

## Detail Current User

url: localhost:3000/me/detail
NOTE: pakai token untuk Header: Authorization: Bearer (token)
pakai token dari login

## Update Data Current User

url: url: localhost:3000/me/detail
NOTE: pakai axios.patch, pakai headers juga kayak detail current user, pakai Body: Content-Type: form-data (supaya bisa upload gambar)
