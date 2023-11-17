from flask import Flask, request, jsonify
from docx import Document
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/get_answer', methods=['POST'])
def get_answer():
    file = request.files['file']
    question = request.form['question']

    try:
        doc = Document(file)
        text = ''
        tables_data = []

        for element in doc.element.body:
            if element.tag.endswith('tbl'):  
                table = [
                    [' '.join(paragraph.text if paragraph.text is not None else '' for paragraph in cell)]
                    for row in element
                    for cell in row
                ]
                tables_data.append(table)
            elif element.text is not None:  
                text += element.text

        model_name = "deepset/roberta-base-squad2"
        model = AutoModelForQuestionAnswering.from_pretrained(model_name)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        nlp = pipeline('question-answering', model=model, tokenizer=tokenizer)

        context = '\n\n'.join([
            text,
            *['\n'.join(['\t'.join(cell) for cell in table]) for table in tables_data]
        ])

        print(f"Question: {question}")
        print(f"Context: {context}")

        res = nlp(question=question, context=context)
        answer = res['answer']
        confidence = res['score']

        # Define a confidence threshold
        confidence_threshold = 0.05

        if not answer.strip() or confidence < confidence_threshold:  
            print("Answer: No information available")
            return jsonify({'answer': "Based on my last training, I don't have information on this."})

        print(f"Answer: {answer}")
        return jsonify({'answer': answer})

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': f'An error occurred: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
