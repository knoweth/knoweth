require "application_system_test_case"

class DocumentsTest < ApplicationSystemTestCase
  test "visiting the index" do
    sign_in_as(users(:alex))
    visit documents_url
  
    assert_selector "h1", text: "Documents"
  end

  test "creates document" do
    sign_in_as(users(:alex))
    create_document
  end

  test "renames document" do
    sign_in_as(users(:alex))
    create_document
    click_on 'Rename'

    # For some reason this pops up an alert sometimes
    accept_alert do
      fill_in 'document_title', with: 'Test2'
      click_on 'Update Document'
    end

    assert_text 'Test2'
    assert_text 'All changes saved' # Good save
  end

  private def create_document
    visit documents_url
    click_on 'Create new document'

    fill_in 'document_title', with: 'Test'
    click_on 'Save Document'

    assert_text 'Test'
    assert_text 'All changes saved' # Good save
  end
end
