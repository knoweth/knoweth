require "application_system_test_case"

class WelcomesTest < ApplicationSystemTestCase
  test "the homepage loads" do
    visit root_url
    assert_selector ".navbar-brand", text: "Knoweth"
  end
end
