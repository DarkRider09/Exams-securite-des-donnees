// Dans login.ts

return (req: Request, res: Response, next: NextFunction) => {
  verifyPreLoginChallenges(req)
  models.sequelize.query(
    `SELECT * FROM Users WHERE email = $email AND password = $pass AND deletedAt IS NULL`,
    {
      bind: { email: req.body.email, pass: security.hash(req.body.password) },
      model: UserModel,
      plain: true
    }
  )
    .then((authenticatedUser) => {
      const user = utils.queryResultToJson(authenticatedUser)
      if (user.data?.id && user.data.totpSecret !== '') {
        res.status(401).json({
          status: 'totp_token_required',
          data: {
            tmpToken: security.authorize({
              userId: user.data.id,
              type: 'password_valid_needs_second_factor_token'
            })
          }
        })
      } else if (user.data?.id) {
        afterLogin(user.data, res, next)
      } else {
        res.status(401).send(res.__('Invalid email or password.'))
      }
    }).catch((error: Error) => {
      next(error)
    })
}
