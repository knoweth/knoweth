require "application_system_test_case"

class DocumentsTest < ApplicationSystemTestCase
  test "visiting the index" do
    sign_in_as(users(:alex))
    visit documents_url
  
    assert_selector "h1", text: "Documents"
  end

  test "creates document" do
    sign_in_as(users(:alex))

    visit documents_url
    click_on 'Create new document'

    fill_in 'document_title', with: 'Test'
    click_on 'Save Document'

    assert_text 'All changes saved' # Good save
  end
end
