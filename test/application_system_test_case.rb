require "test_helper"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  driven_by :selenium, using: :headless_chrome, screen_size: [1400, 1400], options: {args: %w(headless disable-gpu no-sandbox disable-dev-shm-usage)}

  private def sign_in_as(user)
    visit new_user_session_url

    fill_in 'user_email', with: user.email
    fill_in 'user_password', with: "test"
    click_on 'Log in'
    assert_equal current_path, root_path
  end
end
